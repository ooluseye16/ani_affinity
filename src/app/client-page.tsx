
"use client";

import { useState, useEffect, FormEvent } from 'react';
import type { SuggestAnimeOutput } from '@/ai/flows/suggest-anime';
import { suggestAnime } from '@/ai/flows/suggest-anime';
import type { NewcomerAnimeOutput } from '@/ai/flows/newcomer-anime-flow';
import { suggestNewcomerAnime } from '@/ai/flows/newcomer-anime-flow';
import type { AnimeOfTheDayOutput } from '@/ai/flows/anime-of-the-day-flow';
// We keep the import for the type, but getAnimeOfTheDay will be called by a backend process
// import { getAnimeOfTheDay } from '@/ai/flows/anime-of-the-day-flow'; 
import type { ResearchAnimeOutput } from '@/ai/flows/research-anime-flow';
import { researchAnime } from '@/ai/flows/research-anime-flow';

import useLocalStorage from '@/hooks/useLocalStorage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { SuggestionCard } from '@/components/SuggestionCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PlusCircle, XCircle, Sparkles, AlertCircle, ListChecks, Smile, Rocket, Loader2, Award, Search, BookOpen, Tv2, CalendarDays, Users, Film, ClockIcon, ShieldAlert, Info, GitFork, Image as ImageIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Import your initialized db


// Placeholder function for fetching Anime of the Day from your database
// TODO: Implement this function to fetch from your actual database (e.g., Firestore)
async function fetchAnimeOfTheDayFromDB(): Promise<AnimeOfTheDayOutput | null> {
  console.log("Attempting to fetch Anime of the Day from DB (placeholder)...");

  try {
    // Reference to the specific document where Anime of the Day is stored
    const animeDocRef = doc(db, "app_data", "anime_of_the_day");
    const docSnap = await getDoc(animeDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as AnimeOfTheDayOutput;
      console.log("Anime of the Day fetched:", data.title);

      // Firestore Timestamps are objects, you might want to convert them to JS Date objects
      // if not automatically handled by your SDK version or if you prefer
      if (data.lastUpdated && typeof data.lastUpdated === 'function') {
        data.lastUpdated = data.lastUpdated;
      }

      return data;
    } else {
      console.log("No 'Anime of the Day' document found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching Anime of the Day from DB:", error);
    return null;
  }
}


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

  const [animeOfTheDay, setAnimeOfTheDay] = useState<AnimeOfTheDayOutput | null>(null);
  const [isAnimeOfTheDayLoading, setIsAnimeOfTheDayLoading] = useState(false);
  const [animeOfTheDayError, setAnimeOfTheDayError] = useState<string | null>(null);

  const [researchQuery, setResearchQuery] = useState('');
  const [researchResult, setResearchResult] = useState<ResearchAnimeOutput | null>(null);
  const [isResearchLoading, setIsResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);

  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const loadAnimeOfTheDay = async () => {
        setIsAnimeOfTheDayLoading(true);
        setAnimeOfTheDayError(null);
        setAnimeOfTheDay(null); // Clear previous
        try {
          const result = await fetchAnimeOfTheDayFromDB(); // Changed to DB fetch
          if (result) {
            setAnimeOfTheDay(result);
          } else {
            setAnimeOfTheDayError("Anime of the Day is not available at the moment. Please check back later.");
            toast({
              title: "Anime of the Day Unavailable",
              description: "Could not fetch the Anime of the Day. It might be updating or not set.",
              variant: "default", 
            });
          }
        } catch (e) {
          console.error(e);
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
          setAnimeOfTheDayError(`Failed to get Anime of the Day: ${errorMessage}`);
          toast({
            title: "Error Fetching Anime of the Day",
            description: `An error occurred: ${errorMessage}`,
            variant: "destructive",
          });
        } finally {
          setIsAnimeOfTheDayLoading(false);
        }
      };
      loadAnimeOfTheDay();
    }
  }, [isClient, toast]);

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
    if (isClient && likedAnimeList.length === 0) {
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

  const handleResearchAnime = async (event: FormEvent) => {
    event.preventDefault();
    if (!researchQuery.trim()) {
      setResearchError('Please enter an anime title to research.');
      toast({
        title: "No Anime Title",
        description: "Enter an anime title to get information.",
        variant: "destructive",
      });
      return;
    }

    setIsResearchLoading(true);
    setResearchError(null);
    setResearchResult(null);

    try {
      const result = await researchAnime({ animeTitle: researchQuery });
      setResearchResult(result);
      toast({
        title: "Research Complete!",
        description: `Information for ${result.title} is ready.`,
      });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setResearchError(`Failed to research anime: ${errorMessage}`);
      toast({
        title: "Error Researching Anime",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsResearchLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      {isClient && ( // Keep isClient check for this section
        <Card className="shadow-xl border-primary border-2 mb-10">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl flex items-center justify-center gap-3 text-primary">
              <Award className="h-8 w-8" />
              Anime of the Day
              <Award className="h-8 w-8" />
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground pt-1">
              Today's special pick! (Note: Needs database integration for consistency)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-6 min-h-[150px]"> {/* Added min-h for consistent height */}
            {isAnimeOfTheDayLoading && <LoadingSpinner size={60} className="h-16 w-16 text-primary" />}
            {animeOfTheDayError && !isAnimeOfTheDayLoading && (
              <div role="alert" className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p>{animeOfTheDayError}</p>
              </div>
            )}
            {animeOfTheDay && !isAnimeOfTheDayLoading && !animeOfTheDayError && (
              <div className="w-full max-w-md">
                <SuggestionCard suggestion={animeOfTheDay} index={0} />
              </div>
            )}
            {!animeOfTheDay && !isAnimeOfTheDayLoading && !animeOfTheDayError && (
                 <div role="alert" className="p-4 bg-muted/50 border border-border text-muted-foreground rounded-md flex flex-col items-center gap-2 text-center">
                    <Smile className="h-8 w-8" />
                    <p>The Anime of the Day is currently unavailable. <br/>This feature requires database setup.</p>
                 </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-headline font-bold text-primary mb-2">Discover Your Next Favorite Anime</h1>
        <p className="text-lg text-muted-foreground">
          Let our AI guide you through the vast world of anime, whether you're a seasoned fan or just starting out.
        </p>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="recommendations" className="py-3 text-base">
            <ListChecks className="mr-2 h-5 w-5" /> Your Personalized Picks
          </TabsTrigger>
          <TabsTrigger value="newcomer" className="py-3 text-base">
            <Rocket className="mr-2 h-5 w-5" /> New to Anime? Start Here!
          </TabsTrigger>
          <TabsTrigger value="research" className="py-3 text-base">
            <Search className="mr-2 h-5 w-5" /> Research Anime
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

        <TabsContent value="research">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <BookOpen className="h-7 w-7 text-primary" />
                Look Up Anime Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResearchAnime} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter an anime title to get info (e.g., Cowboy Bebop)"
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  aria-label="Anime title for research"
                />
                <Button type="submit" disabled={isResearchLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isResearchLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Research Anime
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {researchError && (
            <div role="alert" className="mt-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{researchError}</p>
            </div>
          )}

          {isResearchLoading && <LoadingSpinner size={48} className="mt-6 h-12 w-12 text-primary" />}
          
          {researchResult && !isResearchLoading && (
            <Card className="mt-8 shadow-xl animate-fade-in">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary">{researchResult.title}</CardTitle>
                 {researchResult.imageUrl && (
                    <div className="mt-4 relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-md">
                        <Image 
                            src={researchResult.imageUrl.startsWith('http') ? researchResult.imageUrl : `https://placehold.co/600x400.png`} 
                            alt={`Image for ${researchResult.title}`} 
                            layout="fill" 
                            objectFit="cover"
                            data-ai-hint="anime promotional art"
                        />
                    </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <div>
                  <h3 className="font-semibold text-lg text-muted-foreground mb-2 flex items-center gap-2"><Info className="h-5 w-5 text-primary" />Description</h3>
                  <p className="text-foreground leading-relaxed">{researchResult.description}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-md text-muted-foreground mb-2 flex items-center gap-2"><Tv2 className="h-5 w-5 text-primary" />Details</h4>
                    <ul className="space-y-2">
                      {researchResult.studio && <li><strong>Studio:</strong> {researchResult.studio}</li>}
                      {researchResult.yearReleased && <li><strong>Released:</strong> {researchResult.yearReleased}</li>}
                      {researchResult.status && <li><strong>Status:</strong> {researchResult.status}</li>}
                      {researchResult.numberOfEpisodes && <li><strong>Episodes:</strong> {researchResult.numberOfEpisodes}</li>}
                      {researchResult.averageEpisodeLength && <li><strong>Ep. Length:</strong> {researchResult.averageEpisodeLength}</li>}
                      {researchResult.ageRating && <li><strong>Age Rating:</strong> {researchResult.ageRating}</li>}
                      {researchResult.sourceMaterial && <li><strong>Source:</strong> {researchResult.sourceMaterial}</li>}
                    </ul>
                  </div>
                  <div>
                    {researchResult.genres && researchResult.genres.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-md text-muted-foreground mb-2 flex items-center gap-2"><Film className="h-5 w-5 text-primary" />Genres</h4>
                        <div className="flex flex-wrap gap-2">
                          {researchResult.genres.map(genre => <Badge key={genre} variant="secondary">{genre}</Badge>)}
                        </div>
                      </div>
                    )}
                    {researchResult.themes && researchResult.themes.length > 0 && (
                       <div>
                        <h4 className="font-semibold text-md text-muted-foreground mb-2 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" />Themes</h4> {/* Using ImageIcon as a placeholder for themes */}
                        <div className="flex flex-wrap gap-2">
                          {researchResult.themes.map(theme => <Badge key={theme} variant="outline">{theme}</Badge>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {researchResult.criticalReception && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-lg text-muted-foreground mb-2 flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Reception</h3>
                      <p className="text-foreground leading-relaxed">{researchResult.criticalReception}</p>
                    </div>
                  </>
                )}

                {researchResult.whyWatch && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-lg text-muted-foreground mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Why Watch?</h3>
                      <p className="text-foreground leading-relaxed">{researchResult.whyWatch}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
          {isClient && researchResult === null && !isResearchLoading && !researchError && researchQuery !== '' && (
             <Card className="mt-6 shadow-lg text-center">
               <CardContent className="p-6">
                <p className="text-muted-foreground">
                  No information found for "{researchQuery}". Try a different title or check for typos.
                </p>
               </CardContent>
             </Card>
          )}


        </TabsContent>
      </Tabs>
    </div>
  );
}

