import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

export function CustomNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold tracking-tight text-primary">
            404
          </h1>
          <div className="relative -mt-8 mb-4 flex justify-center">
            <div className="rounded-full bg-muted px-4 py-2 text-sm font-medium">
              Page not found
            </div>
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          Oops! We've hit a digital dead end
        </h2>
        <p className="mb-8 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved to another
          URL.
        </p>

        <div className="mb-8">
          <form className="mx-auto flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="Search for content..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </form>
        </div>

        <div className="mb-8">
          <div className="flex flex-col justify-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="javascript:history.back()">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go back
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link
              href="/contact"
              className="font-medium text-primary hover:underline"
            >
              Contact our support team
            </Link>
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Your Company. All rights reserved.
      </div>
    </div>
  );
}
