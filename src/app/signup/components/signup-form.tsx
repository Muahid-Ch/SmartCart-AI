'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useAuth } from '@/firebase';
import Link from 'next/link';
import { setDoc } from 'firebase/firestore';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export function SignupForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    initiateEmailSignUp(
      auth,
      values.email,
      values.password
    ).then(userCredential => {
       if (userCredential && userCredential.user) {
        const user = userCredential.user;
        const userDocRef = doc(firestore, 'users', user.uid);
        
        // Non-blocking write to Firestore
        setDoc(userDocRef, {
          id: user.uid,
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          createdAt: new Date().toISOString(),
          bankBalance: 0,
        }, { merge: true });
        
        toast({
          title: 'Account Created!',
          description: 'Welcome to SmartCart AI. Redirecting you to the dashboard.',
        });
        
        router.push('/dashboard');
      }
    }).catch(error => {
      let description = 'Could not create your account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email is already in use. Please log in or use a different email.';
      }
      console.error('Error signing up:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: description,
      });
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Create an account to start managing your budget.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Signing up...' : 'Sign Up'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
