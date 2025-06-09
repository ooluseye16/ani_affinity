
import type { SuggestAnimeOutput } from '@/ai/flows/suggest-anime';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

type Suggestion = SuggestAnimeOutput['suggestions'][0];

interface SuggestionCardProps {
  suggestion: Suggestion;
  index: number;
}

export function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  return (
    <Card 
      className="w-full shadow-lg animate-fade-in flex flex-col"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary">{suggestion.title}</CardTitle>
        <CardDescription className="text-sm pt-1">{suggestion.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        {suggestion.reason && (
          <div className="space-y-1 pt-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Why you might like it:</h4>
            <p className="text-sm text-foreground">{suggestion.reason}</p>
          </div>
        )}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold">{suggestion.rating.toFixed(1)} / 10</span>
            <Badge variant="secondary">Rating</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            <span className="font-semibold">{suggestion.confidence.toFixed(0)}%</span>
            <Badge variant="outline">Likelihood</Badge>
          </div>
          <Progress value={suggestion.confidence} className="h-2" />
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          AI-powered suggestion. Your mileage may vary.
        </p>
      </CardFooter>
    </Card>
  );
}
