'use client';

import { useState } from 'react';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { answerUserQueries } from '@/ai/flows/answer-user-queries';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { answer } = await answerUserQueries({ query: input });
      const assistantMessage: Message = { role: 'assistant', content: answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error answering query:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get an answer from the assistant.',
      });
      // remove the user message if the API call fails
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          aria-label="Open AI Chat Assistant"
        >
          <Bot className="h-7 w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>AI Chat Assistant</SheetTitle>
          <SheetDescription>
            Ask me anything about your spending habits.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 pr-4 -mr-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p>{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 text-sm bg-muted flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., How much did I spend on dairy?"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
