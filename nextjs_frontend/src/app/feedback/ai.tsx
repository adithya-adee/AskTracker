"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Send, Loader2 } from "lucide-react";

// HuggingFace Router for OpenAI-compatible API
const API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN || "";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AiChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <MessageSquare className="h-4 w-4" />
          Ask AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Assistant</DialogTitle>
        </DialogHeader>
        <AiChatBox setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

interface AiChatBoxProps {
  setOpen: (open: boolean) => void;
}

function AiChatBox({ setOpen }: AiChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. How can I help you with your feedback today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message to chat
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      if (HF_TOKEN) {
        // Using Hugging Face's router with the OpenAI-compatible API
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${HF_TOKEN}`,
          },
          body: JSON.stringify({
            model: "moonshotai/Kimi-K2-Instruct",
            messages: [...messages, userMessage],
            max_tokens: 500,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("API Error:", response.status, errorData);
          throw new Error(
            `API Error: ${response.status} - ${
              errorData.error?.message || "Unknown error"
            }`
          );
        }

        const data = await response.json();
        const assistantMessage: Message = {
          role: "assistant",
          content: data.choices[0].message.content,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Fallback if no API key is provided
        const fallbackResponse = await new Promise<string>((resolve) => {
          setTimeout(() => {
            resolve(`I understand you're asking about: "${input}". 
            To get real AI responses, please add your Hugging Face API token to the environment variables as NEXT_PUBLIC_HF_TOKEN.`);
          }, 1000);
        });

        const assistantMessage: Message = {
          role: "assistant",
          content: fallbackResponse,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble responding right now. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Card className="flex-1 overflow-hidden">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.role === "user" ? "U" : "AI"}
                    </AvatarFallback>
                    {message.role === "assistant" && (
                      <AvatarImage src="/ai-avatar.png" alt="AI" />
                    )}
                  </Avatar>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <Textarea
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              rows={1}
              maxLength={500}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
