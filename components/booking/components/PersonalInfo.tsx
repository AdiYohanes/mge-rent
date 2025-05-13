"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import Link from "next/link";

const FormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone Number must be at least 10 digits.",
  }),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions.",
  }),
});

interface UserData {
  username?: string;
  email?: string;
  phoneNumber?: string;
}

const PersonalInfo = () => {
  const [useLoginInfo, setUseLoginInfo] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      phoneNumber: "",
      terms: false,
    },
  });

  // Check if user is logged in when component mounts
  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem("user");
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        setIsUserLoggedIn(true);
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
  }, []);

  // Apply user data to form if checkbox is checked and user is logged in
  useEffect(() => {
    if (useLoginInfo && isUserLoggedIn && userData) {
      form.setValue("fullName", userData.username || "");
      // Only set email and phone if they exist
      if (userData.email) form.setValue("email", userData.email);
      if (userData.phoneNumber)
        form.setValue("phoneNumber", userData.phoneNumber);
      form.setValue("username", userData.username || "");
    }
  }, [useLoginInfo, isUserLoggedIn, userData, form]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast(
      <div>
        <div>You submitted the following values:</div>
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>
    );
  }

  const handleUseLoginInfoChange = (checked: boolean) => {
    setUseLoginInfo(checked);

    if (checked) {
      if (isUserLoggedIn) {
        // Apply user data from local storage to form
        if (userData) {
          form.setValue("fullName", userData.username || "");
          // Only set email and phone if they exist
          if (userData.email) form.setValue("email", userData.email);
          if (userData.phoneNumber)
            form.setValue("phoneNumber", userData.phoneNumber);
          form.setValue("username", userData.username || "");
        }
      } else {
        // Show toast message if user is not logged in
        toast.error("You must log in to use this information.");
      }
    }
  };

  return (
    <div className="flex flex-col w-full justify-start border border-[#B99733] p-6 md:p-8">
      {/* Title */}
      <div className="flex w-full justify-start mb-6">
        <h1 className="font-minecraft text-3xl font-semibold text-center text-[#B99733]">
          Personal Information
        </h1>
      </div>

      {/* Form */}
      <div className="flex w-full justify-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full max-w-md space-y-6"
          >
            {/* Checkbox for Use login information */}
            <FormField
              control={form.control}
              name="email"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useLoginInfo"
                        className="cursor-pointer"
                        checked={useLoginInfo}
                        onCheckedChange={handleUseLoginInfoChange}
                      />
                      <label
                        htmlFor="useLoginInfo"
                        className="text-sm font-medium text-gray-700"
                      >
                        Use login information
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      disabled={useLoginInfo && isUserLoggedIn} // Disable field if checkbox is checked and user is logged in
                    />
                  </FormControl>
                  <FormMessage role="banner" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john.doe@example.com"
                      {...field}
                      disabled={useLoginInfo && isUserLoggedIn}
                    />
                  </FormControl>
                  <FormMessage role="banner" />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="shadcn"
                      {...field}
                      disabled={useLoginInfo && isUserLoggedIn}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage role="banner" />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+62 81234567890"
                      {...field}
                      disabled={useLoginInfo && isUserLoggedIn}
                    />
                  </FormControl>
                  <FormMessage role="banner" />
                </FormItem>
              )}
            />

            {/* Checkbox for terms and conditions */}
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium text-gray-700"
                      >
                        By ticking, you are confirming that you have read,
                        understood, and agree to our{" "}
                        <Link
                          href="/terms"
                          className="text-[#B99733] underline hover:no-underline"
                        >
                          Terms & Conditions
                        </Link>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage role="banner" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PersonalInfo;
