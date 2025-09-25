
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStyleRecommendation, type StyleRecommendationInput, type StyleRecommendationOutput } from '@/ai/flows/style-recommendation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader2, Send, User, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import type { SuggestedProduct } from '@/lib/types';


const formSchema = z.object({
  message: z.string().min(1, { message: "Veuillez entrer un message." }),
});

type FormData = z.infer<typeof formSchema>;

type ChatMessage = {
    role: 'user' | 'bot';
    content: string;
    products?: SuggestedProduct[];
};

export default function ChatInterface() {
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  useEffect(() => {
    // Auto-scroll to the bottom when conversation updates
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [conversation]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const userMessage: ChatMessage = { role: 'user', content: data.message };
    setConversation(prev => [...prev, userMessage]);
    form.reset();
    setIsLoading(true);

    try {
      // For now, we adapt the chat message to the existing flow input.
      // A more advanced implementation would use a proper chat history.
      const flowInput: StyleRecommendationInput = {
        occasion: 'N/A',
        stylePreferences: data.message,
        colorPreferences: 'N/A',
        itemPreferences: 'Foulard, Turban, Abaya',
        additionalDetails: data.message,
      };

      const result = await getStyleRecommendation(flowInput);
      
      const botMessage: ChatMessage = { 
          role: 'bot', 
          content: result.recommendation || "Désolé, je n'ai pas pu générer de réponse.",
          products: result.suggestedProducts
      };
      setConversation(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error getting style recommendation:', error);
      const errorMessage: ChatMessage = { 
        role: 'bot', 
        content: "Oups! Une erreur est survenue. Veuillez réessayer." 
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl w-full">
      <CardContent className="p-4">
        <ScrollArea className="h-[50vh] w-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {conversation.map((msg, index) => (
              <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : '')}>
                {msg.role === 'bot' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                    "p-3 rounded-lg max-w-sm whitespace-pre-wrap", 
                    msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-muted rounded-bl-none'
                )}>
                    <p>{msg.content}</p>
                    {msg.products && msg.products.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <h4 className="font-semibold text-sm">Produits suggérés:</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {msg.products.map(p => (
                                    <Link key={p.id} href={`/products/${p.slug}`} target="_blank" className="border rounded-md p-2 hover:bg-background/50 transition-colors">
                                        <div className="relative aspect-square w-full rounded overflow-hidden mb-1">
                                            <Image src={p.imageUrl} alt={p.name} fill sizes="100px" className="object-contain"/>
                                        </div>
                                        <p className="text-xs font-medium truncate">{p.name}</p>
                                        <p className="text-xs text-muted-foreground">{p.price.toFixed(2)} DT</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                 {msg.role === 'user' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 border">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-muted rounded-bl-none">
                        <Loader2 className="h-5 w-5 animate-spin"/>
                    </div>
                </div>
            )}
             {conversation.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    <p>Posez-moi une question pour commencer ! Par exemple : <br/><em>"Je cherche une tenue élégante pour un mariage."</em></p>
                </div>
             )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-center gap-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input placeholder="Décrivez votre besoin..." {...field} autoComplete="off" />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Envoyer</span>
            </Button>
          </form>
        </Form>
      </CardFooter>
    </Card>
  );
}

