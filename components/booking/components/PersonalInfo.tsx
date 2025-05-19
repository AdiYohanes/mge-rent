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
import React, { useEffect } from "react";
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

interface UserDataFromCookie {
  username?: string;
  email?: string;
  phone?: string;
}

interface PersonalInfoProps {
  initialData?: UserDataFromCookie | null;
  onValidityChange?: (isValid: boolean) => void;
}

const PersonalInfo = ({ initialData, onValidityChange }: PersonalInfoProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      phoneNumber: "",
      terms: false,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (onValidityChange) {
      onValidityChange(form.formState.isValid);
    }
  }, [form.formState.isValid, onValidityChange]);

  useEffect(() => {
    if (initialData) {
      form.setValue("fullName", initialData.username || "");
      form.setValue("email", initialData.email || "");
      form.setValue("username", initialData.username || "");
      form.setValue("phoneNumber", initialData.phone || "");
      form.trigger();
    } else {
      form.reset({
        fullName: "",
        email: "",
        username: "",
        phoneNumber: "",
        terms: form.getValues("terms"),
      });
    }
  }, [initialData, form]);

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
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                      type="email"
                      {...field}
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
                    <Input placeholder="shadcn" {...field} />
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
                    <Input placeholder="+62 81234567890" {...field} />
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
