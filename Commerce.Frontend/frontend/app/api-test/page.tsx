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
      
      let results = [];
      
      // Test 1: Categories endpoint
      try {
        const categoriesResponse = await fetch(`${apiUrl}/api/Categories/getAll`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          results.push(`✅ Categories: ${categoriesResponse.status} - Success`);
        } else {
          results.push(`❌ Categories: ${categoriesResponse.status} - Failed`);
        }
      } catch (error) {
        results.push(`❌ Categories: Connection Error - ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Test 2: Login endpoint with different admin credentials
      const adminCredentials = [
        { email: "admin", password: "Admin123!" },
        { email: "admin", password: "admin123" },
        { email: "admin", password: "Admin.123" },
        { email: "admin@isstore.com", password: "Admin123!" }
      ];
      
      for (const cred of adminCredentials) {
        try {
          const loginResponse = await fetch(`${apiUrl}/api/Auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cred)
          });
          
          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            results.push(`✅ Login SUCCESS with ${cred.email}/${cred.password}: ${loginResponse.status}\nToken: ${loginData.data?.accessToken?.substring(0, 50)}...`);
            break; // İlk başarılı olandan sonra dur
          } else if (loginResponse.status === 401) {
            results.push(`❌ Login failed with ${cred.email}/${cred.password}: Wrong credentials`);
          } else {
            results.push(`⚠️ Login with ${cred.email}/${cred.password}: Status ${loginResponse.status}`);
          }
        } catch (error) {
          results.push(`❌ Connection error with ${cred.email}: ${error instanceof Error ? error.message : String(error)}`);
          break; // Connection error varsa diğerlerini deneme
        }
      }
      
      // Test 3: Products endpoint
      try {
        const productsResponse = await fetch(`${apiUrl}/api/Products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (productsResponse.ok) {
          results.push(`✅ Products: ${productsResponse.status} - Success`);
        } else {
          results.push(`❌ Products: ${productsResponse.status} - Failed`);
        }
      } catch (error) {
        results.push(`❌ Products: Connection Error - ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Test 4: Check current authentication status
      try {
        const accessToken = localStorage.getItem('accessToken');
        const userInfo = localStorage.getItem('userInfo');
        
        if (accessToken) {
          const currentUserResponse = await fetch(`${apiUrl}/api/Auth/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
          });
          
          if (currentUserResponse.ok) {
            const userData = await currentUserResponse.json();
            results.push(`✅ Auth Status: Logged in as ${userData.data?.firstName || 'Unknown'}\nToken Valid: Yes\nStored User: ${userInfo ? JSON.parse(userInfo).firstName : 'None'}`);
          } else {
            results.push(`❌ Auth Status: Token invalid (${currentUserResponse.status})\nStored User: ${userInfo ? JSON.parse(userInfo).firstName : 'None'}`);
          }
        } else {
          results.push(`❌ Auth Status: No token found\nStored User: ${userInfo ? JSON.parse(userInfo).firstName : 'None'}`);
        }
      } catch (error) {
        results.push(`❌ Auth Check Error: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      setResult(`API Test Results:\n\n${results.join('\n\n')}`);
      
    } catch (error) {
      console.error("API Test Error:", error);
      setResult(`❌ General Error: ${error instanceof Error ? error.message : String(error)}`);
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
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">SSL Sertifika Sorunu mu?</h3>
            <p className="text-sm text-yellow-700 mb-2">
              Eğer connection error alıyorsanız, önce bu linke tıklayın:
            </p>
            <a 
              href="https://localhost:7057" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline text-sm"
            >
              https://localhost:7057
            </a>
            <p className="text-sm text-yellow-700 mt-2">
              Açılan sayfada "Gelişmiş" → "Güvenli değil, devam et" seçin.
            </p>
          </div>
          
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
