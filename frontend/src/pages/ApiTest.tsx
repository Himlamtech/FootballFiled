import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const ApiTest = () => {
  const { toast } = useToast();
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("http://localhost:4000/api/");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (method !== "GET" && method !== "DELETE" && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      
      setResponse(JSON.stringify(data, null, 2));
      
      toast({
        title: `${res.status} ${res.statusText}`,
        description: "API call completed",
        variant: res.ok ? "default" : "destructive",
      });
    } catch (error) {
      console.error("API Test Error:", error);
      setResponse(String(error));
      toast({
        title: "Error",
        description: "Failed to complete API call",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>API Testing Tool</CardTitle>
          <CardDescription>Test backend endpoints directly from this interface</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-[150px]">
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input 
                className="flex-1" 
                placeholder="API URL" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
              />
            </div>
            
            {(method === "POST" || method === "PUT" || method === "PATCH") && (
              <Textarea
                placeholder="Request body (JSON)"
                className="min-h-[150px] font-mono"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            )}
            
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </form>
          
          {response && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Response:</h3>
              <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-md overflow-auto max-h-[400px] font-mono text-sm">
                {response}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTest; 