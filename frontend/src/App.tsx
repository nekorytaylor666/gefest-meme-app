import { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { H1, H2 } from "./components/ui/typography";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Loader2 } from "lucide-react";

function App() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    originalSummary: string;
    russianSummaryAndMemes: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl min-h-screen py-8 flex flex-col justify-center items-center">
      <H1>Перевод научных статей в мемы</H1>

      <form onSubmit={handleSubmit} className="w-full mt-8">
        <div className="flex flex-col gap-2 items-start mb-8">
          <Label>Ссылка на статью</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} />
          <p className="text-muted-foreground text-left">
            Ссылка на статью должна быть в формате
            https://example.com/article.pdf
          </p>
          <div className="flex w-full justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                "Перевести статью"
              )}
            </Button>
          </div>
        </div>
      </form>

      {result && (
        <div className="w-full space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Russian Summary and Memes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap">
                {result.russianSummaryAndMemes}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default App;
