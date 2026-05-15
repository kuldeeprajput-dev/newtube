import { ResponsiveModal } from "@/components/responsive-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2Icon, SparklesIcon } from "lucide-react";

interface ThumbnailGenerateModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 5 characters"),
});

export const ThumbnailGenerateModal = ({
  videoId,
  open,
  onOpenChange,
  onSuccess,
}: ThumbnailGenerateModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const utils = trpc.useUtils();

  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onSuccess: () => {
      toast.success("Thumbnail generation started! 🎨", {
        description:
          "Your AI thumbnail is being generated. This may take a minute — we'll update it automatically.",
        duration: 5000,
      });
      form.reset();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast.error("Failed to generate thumbnail", {
        description:
          error.message || "Something went wrong. Please try again.",
        duration: 4000,
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    generateThumbnail.mutate({
      prompt: values.prompt,
      id: videoId,
    });
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Generate thumbnail"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    rows={6}
                    placeholder="Describe the thumbnail you want to generate"
                    disabled={generateThumbnail.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={generateThumbnail.isPending}
            >
              {generateThumbnail.isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="size-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
