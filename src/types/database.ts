export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ListingCategory = "Tools" | "Outdoor" | "Kitchen" | "Electronics" | "Sports" | "Other";
export type BorrowRequestStatus = "pending" | "accepted" | "declined";
export type ToolRequestCommentMediaKind = "image" | "video";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          neighborhood: string | null;
          avatar_url: string | null;
          incoming_requests_seen_at: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          neighborhood?: string | null;
          avatar_url?: string | null;
          incoming_requests_seen_at?: string;
          created_at?: string;
        };
        Update: {
          full_name?: string;
          neighborhood?: string | null;
          avatar_url?: string | null;
          incoming_requests_seen_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          category: ListingCategory;
          photo_url: string | null;
          neighborhood: string;
          pickup_latitude: number | null;
          pickup_longitude: number | null;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description: string;
          category: ListingCategory;
          photo_url?: string | null;
          neighborhood: string;
          pickup_latitude?: number | null;
          pickup_longitude?: number | null;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          category?: ListingCategory;
          photo_url?: string | null;
          neighborhood?: string;
          pickup_latitude?: number | null;
          pickup_longitude?: number | null;
          is_available?: boolean;
        };
        Relationships: [];
      };
      borrow_requests: {
        Row: {
          id: string;
          listing_id: string;
          requester_id: string;
          start_date: string;
          end_date: string;
          message: string | null;
          status: BorrowRequestStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          requester_id: string;
          start_date: string;
          end_date: string;
          message?: string | null;
          status?: BorrowRequestStatus;
          created_at?: string;
        };
        Update: {
          start_date?: string;
          end_date?: string;
          message?: string | null;
          status?: BorrowRequestStatus;
        };
        Relationships: [];
      };
      borrow_request_messages: {
        Row: {
          id: string;
          request_id: string;
          sender_id: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          sender_id: string;
          message: string;
          created_at?: string;
        };
        Update: {
          message?: string;
        };
        Relationships: [];
      };
      borrow_request_reviews: {
        Row: {
          id: string;
          request_id: string;
          listing_id: string;
          reviewer_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          listing_id: string;
          reviewer_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
        Relationships: [];
      };
      tool_requests: {
        Row: {
          id: string;
          requester_id: string;
          title: string;
          description: string;
          category: ListingCategory;
          neighborhood: string;
          needed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          title: string;
          description: string;
          category: ListingCategory;
          neighborhood: string;
          needed_by?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          category?: ListingCategory;
          neighborhood?: string;
          needed_by?: string | null;
        };
        Relationships: [];
      };
      tool_request_comments: {
        Row: {
          id: string;
          request_id: string;
          author_id: string;
          parent_comment_id: string | null;
          message: string;
          media_url: string | null;
          media_kind: ToolRequestCommentMediaKind | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          author_id: string;
          parent_comment_id?: string | null;
          message: string;
          media_url?: string | null;
          media_kind?: ToolRequestCommentMediaKind | null;
          created_at?: string;
        };
        Update: {
          parent_comment_id?: string | null;
          message?: string;
          media_url?: string | null;
          media_kind?: ToolRequestCommentMediaKind | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
