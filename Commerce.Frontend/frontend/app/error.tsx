"use client";

import { useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    /* eslint-disable no-console */
    console.error("Application Error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <h2 className="text-xl font-bold text-danger">Bir Hata Oluştu!</h2>
        </CardHeader>
        <CardBody className="text-center space-y-4">
          <p className="text-gray-600">
            Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
          </p>
          <div className="text-sm text-gray-500 bg-gray-100 p-2 rounded">
            Hata: {error.message}
          </div>
          <Button
            color="primary"
            onClick={() => reset()}
          >
            Tekrar Dene
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
