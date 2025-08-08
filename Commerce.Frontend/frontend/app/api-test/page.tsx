"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";

export default function APITestPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult("");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7057';
      console.log("Testing API URL:", apiUrl);
      
      // Test basic connectivity
      const response = await fetch(`${apiUrl}/Categories/getAll`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ API Connection Success!\n\nStatus: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorText = await response.text();
        setResult(`❌ API Error!\n\nStatus: ${response.status}\nError: ${errorText}`);
      }
    } catch (error) {
      console.error("API Test Error:", error);
      setResult(`❌ Connection Error!\n\nError: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <h1 className="text-2xl font-bold">API Connection Test</h1>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-gray-600">
            API URL: {process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7057'}
          </p>
          
          <Button 
            onClick={testAPI} 
            isLoading={loading}
            color="primary"
          >
            Test API Connection
          </Button>
          
          {result && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">
                {result}
              </pre>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
