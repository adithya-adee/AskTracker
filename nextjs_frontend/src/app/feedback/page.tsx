"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
// Import the AI chat button component
import { AiChatButton } from "./ai";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Feedback {
  id: number;
  user_id: number;
  title: string;
  message: string;
  created_at: string;
  last_modified: string;
}

interface FeedbackCreate {
  title: string;
  message: string;
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [newFeedback, setNewFeedback] = useState<FeedbackCreate>({
    title: "",
    message: "",
  });
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/");
      return;
    }

    setUser(JSON.parse(userData));
    fetchFeedbacks();
  }, [router]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch("http://localhost:8000/feedback");
      const data = await response.json();

      if (response.ok) {
        setFeedbacks(data);
      } else {
        setError("Failed to fetch feedbacks");
      }
    } catch (err) {
      setError("Network error while fetching feedbacks");
    }
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/feedback", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newFeedback,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedbacks([data, ...feedbacks]);
        setNewFeedback({ title: "", message: "" });
        setIsCreateDialogOpen(false);
      } else {
        setError(data.detail || "Failed to create feedback");
      }
    } catch (err) {
      setError("Network error while creating feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeedback) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:8000/feedback/${editingFeedback.id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: editingFeedback.title,
            message: editingFeedback.message,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFeedbacks(
          feedbacks.map((f) => (f.id === editingFeedback.id ? data : f))
        );
        setEditingFeedback(null);
        setIsEditDialogOpen(false);
      } else {
        setError(data.detail || "Failed to update feedback");
      }
    } catch (err) {
      setError("Network error while updating feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (id: number) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const response = await fetch(`http://localhost:8000/feedback/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setFeedbacks(feedbacks.filter((f) => f.id !== id));
      } else {
        setError("Failed to delete feedback");
      }
    } catch (err) {
      setError("Network error while deleting feedback");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Feedback Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Feedback
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Feedback</DialogTitle>
                  <DialogDescription>
                    Share your thoughts and suggestions with us.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateFeedback} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter feedback title"
                      value={newFeedback.title}
                      onChange={(e) =>
                        setNewFeedback({
                          ...newFeedback,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter your feedback message"
                      value={newFeedback.message}
                      onChange={(e) =>
                        setNewFeedback({
                          ...newFeedback,
                          message: e.target.value,
                        })
                      }
                      required
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating..." : "Create Feedback"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add the AI Chat Button here */}
            <AiChatButton />

            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Feedbacks List */}
        <div className="grid gap-4">
          {feedbacks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">
                  No feedback yet. Create your first one!
                </p>
              </CardContent>
            </Card>
          ) : (
            feedbacks.map((feedback) => (
              <Card key={feedback.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{feedback.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">ID: {feedback.id}</Badge>
                      <span>Created: {formatDate(feedback.created_at)}</span>
                      {feedback.created_at !== feedback.last_modified && (
                        <span>
                          • Modified: {formatDate(feedback.last_modified)}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {feedback.user_id === user.id && (
                    <div className="flex gap-2">
                      <Dialog
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingFeedback(feedback)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Feedback</DialogTitle>
                            <DialogDescription>
                              Update your feedback details.
                            </DialogDescription>
                          </DialogHeader>
                          {editingFeedback && (
                            <form
                              onSubmit={handleUpdateFeedback}
                              className="space-y-4"
                            >
                              <div className="space-y-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                  id="edit-title"
                                  value={editingFeedback.title}
                                  onChange={(e) =>
                                    setEditingFeedback({
                                      ...editingFeedback,
                                      title: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-message">Message</Label>
                                <Textarea
                                  id="edit-message"
                                  value={editingFeedback.message}
                                  onChange={(e) =>
                                    setEditingFeedback({
                                      ...editingFeedback,
                                      message: e.target.value,
                                    })
                                  }
                                  required
                                  rows={4}
                                />
                              </div>
                              <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                              >
                                {loading ? "Updating..." : "Update Feedback"}
                              </Button>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteFeedback(feedback.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {feedback.message}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
