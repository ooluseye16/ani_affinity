
"use client";

import { useState, useEffect, FormEvent } from 'react';
import type { SuggestAnimeOutput } from '@/ai/flows/suggest-anime';
import { suggestAnime } from '@/ai/flows/suggest-anime';
import type { NewcomerAnimeOutput } from '@/ai/flows/newcomer-anime-flow';
import { suggestNewcomerAnime } from '@/ai/flows/newcomer-anime-flow';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SuggestionCard } from '@/components/SuggestionCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PlusCircle, XCircle, Sparkles, AlertCircle, ListChecks, Smile, Rocket, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AniAffinityClientPage() {
  const [currentAnimeInput, setCurrentAnimeInput] = useState('');
  const [likedAnimeList, setLikedAnimeList] = useLocalStorage<string[]>('likedAnimeList', []);
  const [suggestions, setSuggestions] = useState<SuggestAnimeOutput['suggestions'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [tasteInput, setTasteInput] = useState('');
  const [newcomerSuggestions, setNewcomerSuggestions] = useState<NewcomerAnimeOutput['suggestions'] | null>(null);
  const [isNewcomerLoading, setIsNewcomerLoading] = useState(false);
  const [newcomerError, setNewcomerError] = useState<string | null>(null);

  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddAnime = () => {
    if (currentAnimeInput.trim() && !likedAnimeList.includes(currentAnimeInput.trim())) {
      setLikedAnimeList([...likedAnimeList, currentAnimeInput.trim()]);
      setCurrentAnimeInput('');
      toast({
        title: "Anime Added!",
        description: `${currentAnimeInput.trim()} added to your liked list.`,
      });
    } else if (likedAnimeList.includes(currentAnimeInput.trim())) {
       toast({
        title: "Already Added",
        description: `${currentAnimeInput.trim()} is already in your liked list.`,
        variant: "destructive",
      });
    }
  };

  const handleRemoveAnime = (animeToRemove: string) => {
    setLikedAnimeList(likedAnimeList.filter(anime => anime !== animeToRemove));
    toast({
      title: "Anime Removed",
      description: `${animeToRemove} removed from your liked list.`,
    });
  };

  const handleGetSuggestions = async (event: FormEvent) => {
    event.preventDefault();
    if (likedAnimeList.length === 0 && isClient) { // Check isClient here
      setError('Please add at least one anime you like.');
      toast({
        title: "No Anime Liked",
        description: "Add some anime to your liked list to get suggestions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const result = await suggestAnime({ likedAnime: likedAnimeList });
      setSuggestions(result.suggestions);
      if (result.suggestions.length === 0) {
        toast({
          title: "No Suggestions Found",
          description: "We couldn't find any suggestions based on your list. Try adding more diverse anime!",
        });
      } else {
        toast({
          title: "Suggestions Ready!",
          description: "Check out your new anime recommendations.",
        });
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get suggestions: ${errorMessage}`);
      toast({
        title: "Error Getting Suggestions",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetNewcomerSuggestions = async (event: FormEvent) => {
    event.preventDefault();
    if (!tasteInput.trim()) {
      setNewcomerError('Please describe your taste in shows/movies.');
      toast({
        title: "No Taste Description",
        description: "Tell us what you like to get newcomer recommendations.",
        variant: "destructive",
      });
      return;
    }

    setIsNewcomerLoading(true);
    setNewcomerError(null);
    setNewcomerSuggestions(null);

    try {
      const result = await suggestNewcomerAnime({ tasteDescription: tasteInput });
      setNewcomerSuggestions(result.suggestions);
       if (result.suggestions.length === 0) {
        toast({
          title: "No Newcomer Suggestions Found",
          description: "We couldn't find any suggestions based on your taste. Try a different description!",
        });
      } else {
        toast({
          title: "Newcomer Suggestions Ready!",
          description: "Check out these anime to start your journey.",
        });
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setNewcomerError(`Failed to get newcomer suggestions: ${errorMessage}`);
      toast({
        title: "Error Getting Newcomer Suggestions",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsNewcomerLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-headline font-bold text-primary mb-2">Discover Your Next Favorite Anime</h1>
        <p className="text-lg text-muted-foreground">
          Let our AI guide you through the vast world of anime, whether you're a seasoned fan or just starting out.
        </p>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="recommendations" className="py-3 text-base">
            <ListChecks className="mr-2 h-5 w-5" /> Your Personalized Picks
          </TabsTrigger>
          <TabsTrigger value="newcomer" className="py-3 text-base">
            <Rocket className="mr-2 h-5 w-5" /> New to Anime? Start Here!
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Sparkles className="h-7 w-7 text-primary" />
                Tell Us What You Love
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGetSuggestions} className="space-y-4">
                <div className="flex gap-2 items-center">
                  <Input
                    type="text"
                    placeholder="Enter an anime title (e.g., Naruto, Attack on Titan)"
                    value={currentAnimeInput}
                    onChange={(e) => setCurrentAnimeInput(e.target.value)}
                    className="flex-grow"
                    aria-label="Anime title input"
                  />
                  <Button type="button" onClick={handleAddAnime} variant="outline" size="icon" aria-label="Add anime">
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>

                {isClient && likedAnimeList.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Your Liked Anime:</h3>
                    <div className="flex flex-wrap gap-2">
                      {likedAnimeList.map(anime => (
                        <Badge key={anime} variant="secondary" className="py-1 px-3 text-sm">
                          {anime}
                          <Button
                            type="button"
                            onClick={() => handleRemoveAnime(anime)}
                            variant="ghost"
                            size="icon"
                            className="ml-1 h-5 w-5 p-0"
                            aria-label={`Remove ${anime}`}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button type="submit" disabled={isLoading || (isClient && likedAnimeList.length === 0)} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Suggestions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get AI Suggestions
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <div role="alert" className="mt-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {isLoading && <LoadingSpinner size={48} className="mt-6 h-12 w-12 text-primary" />}

          {suggestions && suggestions.length > 0 && (
            <div className="mt-8 space-y-6">
              <h2 className="font-headline text-2xl text-center text-primary">Here are your recommendations!</h2>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((suggestion, index) => (
                  <SuggestionCard key={suggestion.title + index} suggestion={suggestion} index={index} />
                ))}
              </div>
            </div>
          )}
          {isClient && suggestions && suggestions.length === 0 && !isLoading && (
             <Card className="mt-6 shadow-lg text-center">
               <CardContent className="p-6">
                <p className="text-muted-foreground">
                  No suggestions found based on your current list. Try adding more or different anime!
                </p>
               </CardContent>
             </Card>
          )}
        </TabsContent>

        <TabsContent value="newcomer">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Smile className="h-7 w-7 text-primary" />
                Describe Your Taste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGetNewcomerSuggestions} className="space-y-4">
                <Input
                  type="text"
                  placeholder="e.g., I love fantasy adventures like Lord of the Rings, or witty comedies."
                  value={tasteInput}
                  onChange={(e) => setTasteInput(e.target.value)}
                  aria-label="Describe your taste in shows/movies"
                />
                <Button type="submit" disabled={isNewcomerLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isNewcomerLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finding Your First Anime...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Find My First Anime
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {newcomerError && (
            <div role="alert" className="mt-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{newcomerError}</p>
            </div>
          )}

          {isNewcomerLoading && <LoadingSpinner size={48} className="mt-6 h-12 w-12 text-primary" />}

          {newcomerSuggestions && newcomerSuggestions.length > 0 && (
            <div className="mt-8 space-y-6">
              <h2 className="font-headline text-2xl text-center text-primary">Anime For Your First Watch!</h2>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newcomerSuggestions.map((suggestion, index) => (
                  <SuggestionCard key={"newcomer-" + suggestion.title + index} suggestion={suggestion} index={index} />
                ))}
              </div>
            </div>
          )}
           {isClient && newcomerSuggestions && newcomerSuggestions.length === 0 && !isNewcomerLoading && (
             <Card className="mt-6 shadow-lg text-center">
               <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Couldn't find specific recommendations for newcomers based on that. Try a broader description!
                </p>
               </CardContent>
             </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
