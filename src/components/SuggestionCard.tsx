
import type { SuggestAnimeOutput } from '@/ai/flows/suggest-anime';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, Layers, Clock, Tags } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Suggestion = SuggestAnimeOutput['suggestions'][0];

interface SuggestionCardProps {
  suggestion: Suggestion;
  index: number;
}

export function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card
          className="w-full shadow-lg animate-fade-in flex flex-col cursor-pointer hover:shadow-xl transition-shadow duration-200"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">{suggestion.title}</CardTitle>
            <CardDescription className="text-sm pt-1 line-clamp-3">{suggestion.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
            {suggestion.reason && (
              <div className="space-y-1 pt-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Why you might like it:</h4>
                <p className="text-sm text-foreground line-clamp-2">{suggestion.reason}</p>
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
              Click to see more details.
            </p>
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">{suggestion.title}</DialogTitle>
          <DialogDescription className="text-sm pt-1 max-h-32 overflow-y-auto">{suggestion.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Details</h4>
            <div className="flex items-start gap-3">
              <Layers className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Seasons: </span>
                <span>{suggestion.seasons || 'N/A'}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Episode Length: </span>
                <span>{suggestion.episodeLength || 'N/A'}</span>
              </div>
            </div>
            {suggestion.tags && suggestion.tags.length > 0 && (
              <div className="flex items-start gap-3">
                <Tags className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-foreground">Tags: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {suggestion.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Analysis</h4>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <div>
                <span className="font-medium text-foreground">Rating: </span>
                <span>{suggestion.rating.toFixed(1)} / 10</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              <div>
                <span className="font-medium text-foreground">Confidence: </span>
                <span>{suggestion.confidence.toFixed(0)}%</span>
              </div>
            </div>
            {suggestion.reason && (
              <div className="pt-2">
                <h5 className="text-sm font-medium text-foreground">Why you might like it:</h5>
                <p className="text-sm text-muted-foreground max-h-28 overflow-y-auto">{suggestion.reason}</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
