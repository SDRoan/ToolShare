export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ListingCategory = "Tools" | "Outdoor" | "Kitchen" | "Electronics" | "Sports" | "Other";
export type BorrowRequestStatus = "pending" | "accepted" | "declined";

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
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          category?: ListingCategory;
          photo_url?: string | null;
          neighborhood?: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
