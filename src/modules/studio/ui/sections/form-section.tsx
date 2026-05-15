"use client";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  CopyCheckIcon,
  CopyIcon,
  GlobeIcon,
  ImagePlusIcon,
  Loader2Icon,
  LockIcon,
  MoreVerticalIcon,
  RefreshCcwIcon,
  RotateCcw,
  SparkleIcon,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { videosUpdateSchema } from "@/db/schema";
import { toast } from "sonner";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import Link from "next/link";
import { snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";
import { ThumbnailGenerateModal } from "../components/thumbnail-generate-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_URL } from "@/constants";

interface FormSectionProps {
  videoId: string;
}

export const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSkeleton = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="space-y-8 lg:col-span-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-56 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-21 w-38.25" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex flex-col gap-y-8 lg:col-span-2">
          <div className="flex flex-col gap-4 bg-[#fffbfb] rounded-xl overflow-hidden">
            <Skeleton className="aspect-video " />
            <div className="px-4 py-4 space-y-6">
              <div className="space-y-2 ">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="space-y-2 ">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="space-y-2 ">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          </div>
          <div className="space-y-2 ">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const utils = trpc.useUtils();
  const router = useRouter();

  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Video updated");
    },
    onError: () => {
      toast.error("Video updating failed");
    },
  });
  const remove = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("Video removed");
      router.push("/studio");
    },
    onError: () => {
      toast.error("Video removing failed");
    },
  });
  const revalidate = trpc.videos.revalidate.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Video revalidated");
    },
    onError: () => {
      toast.error("Video revalidating failed");
    },
  });
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isRestoringThumbnail, setIsRestoringThumbnail] = useState(false);

  const generateTitle = trpc.videos.generateTitle.useMutation({
    onSuccess: () => {
      setIsGeneratingTitle(true);
      toast.success("Title generation started", {
        description: "This may take a few seconds.",
      });
    },
    onError: () => {
      toast.error("Title generating failed");
    },
  });
  
  const generateDescription = trpc.videos.generateDescription.useMutation({
    onSuccess: () => {
      setIsGeneratingDescription(true);
      toast.success("Description generation started", {
        description: "This may take a few seconds.",
      });
    },
    onError: () => {
      toast.error("Description generating failed");
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGeneratingTitle || isGeneratingDescription || isGeneratingThumbnail) {
      interval = setInterval(() => {
        utils.studio.getOne.invalidate({ id: videoId });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGeneratingTitle, isGeneratingDescription, isGeneratingThumbnail, utils.studio.getOne, videoId]);


  useEffect(() => {
    if (isGeneratingTitle) {
      const timeout = setTimeout(() => {
        setIsGeneratingTitle(false);
        toast.error("Title generation timed out. Please try again.");
      }, 45000);
      return () => clearTimeout(timeout);
    }
  }, [isGeneratingTitle]);

  useEffect(() => {
    if (isGeneratingDescription) {
      const timeout = setTimeout(() => {
        setIsGeneratingDescription(false);
        toast.error("Description generation timed out. Please try again.");
      }, 45000);
      return () => clearTimeout(timeout);
    }
  }, [isGeneratingDescription]);

  useEffect(() => {
    if (isGeneratingThumbnail) {
      const timeout = setTimeout(() => {
        setIsGeneratingThumbnail(false);
        toast.error("Thumbnail generation timed out. Please try again.");
      }, 45000);
      return () => clearTimeout(timeout);
    }
  }, [isGeneratingThumbnail]);

   useEffect(() => {
    if (isUploadingThumbnail) {
      const timeout = setTimeout(() => {
        setIsUploadingThumbnail(false);
        toast.error("Thumbnail upload timed out. Please try again.");
      }, 45000);
      return () => clearTimeout(timeout);
    }
  }, [isUploadingThumbnail]);

  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      setIsRestoringThumbnail(true);
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Thumbnail restored");
    },
    onError: () => {
      toast.error("Thumbnail restoring failed");
    },
  });

  const form = useForm<z.infer<typeof videosUpdateSchema>>({
    resolver: zodResolver(videosUpdateSchema),
    defaultValues: video,
  });

  useEffect(() => {
    if (isGeneratingTitle && video.title && video.title !== form.getValues("title")) {
      form.setValue("title", video.title);
      setIsGeneratingTitle(false);
      toast.success("Title generated successfully! 🎉");
    }
    if (isGeneratingDescription && video.description && video.description !== form.getValues("description")) {
      form.setValue("description", video.description);
      setIsGeneratingDescription(false);
      toast.success("Description generated successfully! 🎉");
    }
    if (isGeneratingThumbnail && video.thumbnailUrl && video.thumbnailUrl !== form.getValues("thumbnailUrl")) {
      form.setValue("thumbnailUrl", video.thumbnailUrl);
      setIsGeneratingThumbnail(false);
      toast.success("Thumbnail generated successfully! 🎉");
    }
     if (isUploadingThumbnail && video.thumbnailUrl && video.thumbnailUrl !== form.getValues("thumbnailUrl")) {
      form.setValue("thumbnailUrl", video.thumbnailUrl);
      setIsUploadingThumbnail(false);
      toast.success("Thumbnail updated successfully! 🎉");
    }
    if (isRestoringThumbnail && video.thumbnailUrl && video.thumbnailUrl !== form.getValues("thumbnailUrl")) {
      form.setValue("thumbnailUrl", video.thumbnailUrl);
      setIsRestoringThumbnail(false);
    }
  }, [video.title, video.description, video.thumbnailUrl, isGeneratingTitle, isGeneratingDescription, isGeneratingThumbnail, isUploadingThumbnail, isRestoringThumbnail, form]);

  const onSubmit = (data: z.infer<typeof videosUpdateSchema>) => {
    update.mutate(data);
  };

  const fullUrl = `${APP_URL}/videos/${videoId}`;
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const [thumbnailUploadModalOpen, setThumbnailUploadModalOpen] =
    useState(false);
  const [thumbnailGenerateModalOpen, setThumbnailGenerateModalOpen] =
    useState(false);
  const [thumbnailDropdownOpen, setThumbnailDropdownOpen] = useState(false);

  return (
    <>
      <ThumbnailGenerateModal
        videoId={videoId}
        open={thumbnailGenerateModalOpen}
        onOpenChange={setThumbnailGenerateModalOpen}
        onSuccess={() => setIsGeneratingThumbnail(true)}
      />
      <ThumbnailUploadModal
        videoId={videoId}
        open={thumbnailUploadModalOpen}
        onOpenChange={setThumbnailUploadModalOpen}
        onSuccess={() => setIsUploadingThumbnail(true)}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Video details</h1>
              <p className="text-xs text-muted-foreground">
                Mange your video details
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={update.isPending}>
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="mr-3">
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    onClick={() => revalidate.mutate({ id: videoId })}
                  >
                    <RefreshCcwIcon className="size-4" />
                    Revalidate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    onClick={() => remove.mutate({ id: videoId })}
                  >
                    <TrashIcon className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="space-y-8 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                        <span>Title</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => generateTitle.mutate({ id: videoId })}
                          className="rounded-full size-6 [&_svg]:size-3"
                          disabled={
                            isGeneratingTitle || !video.muxTrackId
                          }
                        >
                          {isGeneratingTitle ? (
                            <Loader2Icon className="size-4 animate-spin" />
                          ) : (
                            <SparklesIcon className="size-4" />
                          )}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add a title to your video"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                        <span>Description</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            generateDescription.mutate({ id: videoId })
                          }
                          className="rounded-full size-6 [&_svg]:size-3"
                          disabled={
                            isGeneratingDescription || !video.muxTrackId
                          }
                        >
                          {isGeneratingDescription ? (
                            <Loader2Icon className="size-4 animate-spin" />
                          ) : (
                            <SparklesIcon className="size-4" />
                          )}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add a description to your video"
                        value={field.value || ""}
                        rows={10}
                        className="resize-none pr-10 min-h-56"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="thumbnailUrl"
                control={form.control}
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className="p-0.5 border border-dashed border-neutral-400 relative h-21 w-38.25 group">
                        <Image
                          fill
                          src={video.thumbnailUrl || THUMBNAIL_FALLBACK}
                          alt="Thumbnail"
                          className="object-cover"
                        />
                        {(isGeneratingThumbnail ||
                          restoreThumbnail.isPending ||
                          isUploadingThumbnail ||
                          isRestoringThumbnail) && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <Loader2Icon className="size-6 text-white animate-spin" />
                          </div>
                        )}
                        <DropdownMenu open={thumbnailDropdownOpen} onOpenChange={setThumbnailDropdownOpen}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className="bg-black/50 hover:bg-black/50 absolute top-1 right-0 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7"
                            >
                              <MoreVerticalIcon className="text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem disabled={isGeneratingThumbnail || isUploadingThumbnail || isRestoringThumbnail || restoreThumbnail.isPending}
                              onClick={() => {
                                setThumbnailUploadModalOpen(true);
                                setThumbnailDropdownOpen(false);
                              }}
                            >
                              <ImagePlusIcon className="size-4" />
                              Change
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={isGeneratingThumbnail || isUploadingThumbnail || isRestoringThumbnail || restoreThumbnail.isPending}
                              onClick={() => {
                                setThumbnailGenerateModalOpen(true);
                                setThumbnailDropdownOpen(false);
                              }}
                            >
                              <SparkleIcon className="size-4" />
                              AI-Generate
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={isGeneratingThumbnail || isUploadingThumbnail || isRestoringThumbnail || restoreThumbnail.isPending}
                              onClick={() => {
                                restoreThumbnail.mutate({ id: videoId });
                                setThumbnailDropdownOpen(false);
                              }}
                            >
                              <RotateCcw className="size-4" />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl  overflow-hidden h-fit">
                <div className="aspect-video  overflow-hidden relative">
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </div>
                <div className="p-4 flex flex-col gap-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video link
                      </p>
                      <div className="flex items-center gap-x-2">
                        <Link prefetch href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {fullUrl}
                          </p>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={onCopy}
                          disabled={false}
                        >
                          {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxStatus || "Processing")}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Subtitle status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(
                          video.muxTrackStatus || "no-subtitle"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">
                          <GlobeIcon className="mr-1 h-4 w-4" /> Public
                        </SelectItem>
                        <SelectItem value="private">
                          <LockIcon className="mr-1 h-4 w-4" /> Private
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
