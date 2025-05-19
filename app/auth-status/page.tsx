"use client";

import { useState, useEffect } from "react";
import { debugToken, checkTokenHealth } from "@/api/auth/authApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { useMounted } from "@/hooks/use-mounted";

export default function AuthStatusPage() {
  const [tokenInfo, setTokenInfo] = useState("Loading...");
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const mounted = useMounted();

  const checkStatus = () => {
    if (!mounted) return;

    try {
      setTokenInfo(debugToken());
      setHealthCheck(checkTokenHealth());
    } catch (e) {
      setTokenInfo(
        `Error checking token: ${
          e instanceof Error ? e.message : "Unknown error"
        }`
      );
    }
  };

  useEffect(() => {
    checkStatus();
  }, [mounted]);

  const clearTokens = () => {
    if (!mounted) return;

    Cookies.remove("token");
    Cookies.remove("user");
    checkStatus();
    alert("Tokens cleared!");
  };

  const refreshPage = () => {
    window.location.reload();
  };

  // Show a skeleton while not mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          Authentication Status Checker
        </h1>
        <Card className="p-4 mb-4">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
        </Card>
        <Card className="p-4 mb-4">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-100 rounded animate-pulse"
              ></div>
            ))}
          </div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-40 bg-gray-100 rounded animate-pulse mb-4"></div>
        </Card>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-28 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Status Checker</h1>

      <Card className="p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Basic Token Info</h2>
        <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
          {tokenInfo}
        </pre>
      </Card>

      {healthCheck && (
        <Card className="p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Token Health Check</h2>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-100 p-2 rounded">
              <strong>Has Token:</strong>{" "}
              {healthCheck.hasToken ? "✅ Yes" : "❌ No"}
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <strong>Has User Data:</strong>{" "}
              {healthCheck.hasUser ? "✅ Yes" : "❌ No"}
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <strong>Token Length:</strong> {healthCheck.tokenLength}{" "}
              characters
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <strong>Token Prefix:</strong> {healthCheck.tokenPrefix}...
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <strong>User Role:</strong> {healthCheck.userRole || "N/A"}
            </div>
          </div>

          <h3 className="font-semibold mb-2">All Cookies</h3>
          <pre className="bg-gray-100 p-2 rounded text-xs mb-4 max-h-40 overflow-auto">
            {JSON.stringify(healthCheck.cookieDetails, null, 2)}
          </pre>

          {healthCheck.issues.length > 0 && (
            <>
              <h3 className="font-semibold mb-2 text-red-500">
                Issues Detected
              </h3>
              <ul className="list-disc pl-5 mb-4">
                {healthCheck.issues.map((issue: string, i: number) => (
                  <li key={i} className="text-red-500">
                    {issue}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      )}

      <div className="flex gap-2">
        <Button onClick={checkStatus} className="bg-blue-500 hover:bg-blue-600">
          Check Again
        </Button>
        <Button onClick={clearTokens} className="bg-red-500 hover:bg-red-600">
          Clear Tokens
        </Button>
        <Button
          onClick={refreshPage}
          className="bg-green-500 hover:bg-green-600"
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
}
