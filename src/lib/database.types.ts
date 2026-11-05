export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "addresses": {
                  Row: {
                    "city": string,"created_at": string,"customer_id": string,"id": string,"is_default": boolean,"label": string | null,"landmark": string | null,"line1": string,"line2": string | null,"name": string,"phone": string,"pincode": string,"state": string,"updated_at": string
                  }
                  Insert: {
                    "city": string,"created_at"?: string,"customer_id": string,"id"?: string,"is_default"?: boolean,"label"?: string | null,"landmark"?: string | null,"line1": string,"line2"?: string | null,"name": string,"phone": string,"pincode": string,"state": string,"updated_at"?: string
                  }
                  Update: {
                    "city"?: string,"created_at"?: string,"customer_id"?: string,"id"?: string,"is_default"?: boolean,"label"?: string | null,"landmark"?: string | null,"line1"?: string,"line2"?: string | null,"name"?: string,"phone"?: string,"pincode"?: string,"state"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "addresses_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    }
                  ]
                },"appointments": {
                  Row: {
                    "booked_by": string | null,"cancel_reason": string | null,"cancelled_at": string | null,"code": string,"completed_at": string | null,"created_at": string,"customer_id": string,"doctor_id": string,"ends_at": string,"external_calendar_event_id": string | null,"fee_paise": number,"hold_expires_at": string | null,"id": string,"intake_completed_at": string | null,"join_url": string | null,"kind": Database["public"]['Enums']["appointment_kind"],"rescheduled_from_id": string | null,"source": string,"starts_at": string,"status": Database["public"]['Enums']["appointment_status"],"updated_at": string,"video_provider": string | null,"video_room": string | null
                  }
                  Insert: {
                    "booked_by"?: string | null,"cancel_reason"?: string | null,"cancelled_at"?: string | null,"code"?: string,"completed_at"?: string | null,"created_at"?: string,"customer_id": string,"doctor_id": string,"ends_at": string,"external_calendar_event_id"?: string | null,"fee_paise"?: number,"hold_expires_at"?: string | null,"id"?: string,"intake_completed_at"?: string | null,"join_url"?: string | null,"kind"?: Database["public"]['Enums']["appointment_kind"],"rescheduled_from_id"?: string | null,"source"?: string,"starts_at": string,"status"?: Database["public"]['Enums']["appointment_status"],"updated_at"?: string,"video_provider"?: string | null,"video_room"?: string | null
                  }
                  Update: {
                    "booked_by"?: string | null,"cancel_reason"?: string | null,"cancelled_at"?: string | null,"code"?: string,"completed_at"?: string | null,"created_at"?: string,"customer_id"?: string,"doctor_id"?: string,"ends_at"?: string,"external_calendar_event_id"?: string | null,"fee_paise"?: number,"hold_expires_at"?: string | null,"id"?: string,"intake_completed_at"?: string | null,"join_url"?: string | null,"kind"?: Database["public"]['Enums']["appointment_kind"],"rescheduled_from_id"?: string | null,"source"?: string,"starts_at"?: string,"status"?: Database["public"]['Enums']["appointment_status"],"updated_at"?: string,"video_provider"?: string | null,"video_room"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "appointments_booked_by_fkey"
      columns: ["booked_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "appointments_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "appointments_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "appointments_rescheduled_from_id_fkey"
      columns: ["rescheduled_from_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id"]
    }
                  ]
                },"assessments": {
                  Row: {
                    "answers": NonNullable<Json>,"created_at": string,"customer_id": string | null,"form_version": string,"id": string,"result": NonNullable<Json>
                  }
                  Insert: {
                    "answers": NonNullable<Json>,"created_at"?: string,"customer_id"?: string | null,"form_version": string,"id"?: string,"result"?: NonNullable<Json>
                  }
                  Update: {
                    "answers"?: NonNullable<Json>,"created_at"?: string,"customer_id"?: string | null,"form_version"?: string,"id"?: string,"result"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "assessments_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    }
                  ]
                },"audit_logs": {
                  Row: {
                    "action": string,"actor_id": string | null,"actor_role": Database["public"]['Enums']["app_role"] | null,"after": Json | null,"before": Json | null,"created_at": string,"entity": string,"entity_id": string | null,"id": number,"ip": unknown
                  }
                  Insert: {
                    "action": string,"actor_id"?: string | null,"actor_role"?: Database["public"]['Enums']["app_role"] | null,"after"?: Json | null,"before"?: Json | null,"created_at"?: string,"entity": string,"entity_id"?: string | null,"id"?: number,"ip"?: unknown
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"actor_role"?: Database["public"]['Enums']["app_role"] | null,"after"?: Json | null,"before"?: Json | null,"created_at"?: string,"entity"?: string,"entity_id"?: string | null,"id"?: number,"ip"?: unknown
                  }
                  Relationships: [
                    
                  ]
                },"availability_exceptions": {
                  Row: {
                    "created_at": string,"doctor_id": string,"ends_at": string,"id": string,"kind": string,"reason": string | null,"starts_at": string
                  }
                  Insert: {
                    "created_at"?: string,"doctor_id": string,"ends_at": string,"id"?: string,"kind": string,"reason"?: string | null,"starts_at": string
                  }
                  Update: {
                    "created_at"?: string,"doctor_id"?: string,"ends_at"?: string,"id"?: string,"kind"?: string,"reason"?: string | null,"starts_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "availability_exceptions_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctors"
      referencedColumns: ["id"]
    }
                  ]
                },"availability_rules": {
                  Row: {
                    "created_at": string,"doctor_id": string,"end_time": string,"id": string,"start_time": string,"weekday": number
                  }
                  Insert: {
                    "created_at"?: string,"doctor_id": string,"end_time": string,"id"?: string,"start_time": string,"weekday": number
                  }
                  Update: {
                    "created_at"?: string,"doctor_id"?: string,"end_time"?: string,"id"?: string,"start_time"?: string,"weekday"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "availability_rules_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctors"
      referencedColumns: ["id"]
    }
                  ]
                },"calendar_busy_blocks": {
                  Row: {
                    "doctor_id": string,"ends_at": string,"external_event_id": string | null,"id": string,"starts_at": string,"synced_at": string
                  }
                  Insert: {
                    "doctor_id": string,"ends_at": string,"external_event_id"?: string | null,"id"?: string,"starts_at": string,"synced_at"?: string
                  }
                  Update: {
                    "doctor_id"?: string,"ends_at"?: string,"external_event_id"?: string | null,"id"?: string,"starts_at"?: string,"synced_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "calendar_busy_blocks_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctors"
      referencedColumns: ["id"]
    }
                  ]
                },"care_checkins": {
                  Row: {
                    "created_at": string,"customer_id": string,"handled_at": string | null,"handled_by": string | null,"id": string,"order_id": string,"responded_at": string | null,"response": string | null,"scheduled_for": string,"sent_message_id": string | null,"side_effect_flag": boolean,"week_no": number
                  }
                  Insert: {
                    "created_at"?: string,"customer_id": string,"handled_at"?: string | null,"handled_by"?: string | null,"id"?: string,"order_id": string,"responded_at"?: string | null,"response"?: string | null,"scheduled_for": string,"sent_message_id"?: string | null,"side_effect_flag"?: boolean,"week_no": number
                  }
                  Update: {
                    "created_at"?: string,"customer_id"?: string,"handled_at"?: string | null,"handled_by"?: string | null,"id"?: string,"order_id"?: string,"responded_at"?: string | null,"response"?: string | null,"scheduled_for"?: string,"sent_message_id"?: string | null,"side_effect_flag"?: boolean,"week_no"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "care_checkins_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "care_checkins_handled_by_fkey"
      columns: ["handled_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "care_checkins_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "care_checkins_sent_message_id_fkey"
      columns: ["sent_message_id"]
isOneToOne: false
      referencedRelation: "messages"
      referencedColumns: ["id"]
    }
                  ]
                },"concerns": {
                  Row: {
                    "body_md": string | null,"id": string,"is_published": boolean,"slug": string,"sort_order": number,"summary": string | null,"title": string,"updated_at": string
                  }
                  Insert: {
                    "body_md"?: string | null,"id"?: string,"is_published"?: boolean,"slug": string,"sort_order"?: number,"summary"?: string | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "body_md"?: string | null,"id"?: string,"is_published"?: boolean,"slug"?: string,"sort_order"?: number,"summary"?: string | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"consents": {
                  Row: {
                    "appointment_id": string | null,"created_at": string,"customer_id": string,"granted": boolean,"id": string,"ip": unknown,"kind": Database["public"]['Enums']["consent_kind"],"source": string,"user_agent": string | null,"version": string
                  }
                  Insert: {
                    "appointment_id"?: string | null,"created_at"?: string,"customer_id": string,"granted": boolean,"id"?: string,"ip"?: unknown,"kind": Database["public"]['Enums']["consent_kind"],"source": string,"user_agent"?: string | null,"version": string
                  }
                  Update: {
                    "appointment_id"?: string | null,"created_at"?: string,"customer_id"?: string,"granted"?: boolean,"id"?: string,"ip"?: unknown,"kind"?: Database["public"]['Enums']["consent_kind"],"source"?: string,"user_agent"?: string | null,"version"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "consents_appointment_id_fkey"
      columns: ["appointment_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "consents_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    }
                  ]
                },"consult_credits": {
                  Row: {
                    "amount_paise": number,"appointment_id": string,"created_at": string,"customer_id": string,"expires_at": string,"id": string,"used_at": string | null,"used_order_id": string | null
                  }
                  Insert: {
                    "amount_paise": number,"appointment_id": string,"created_at"?: string,"customer_id": string,"expires_at": string,"id"?: string,"used_at"?: string | null,"used_order_id"?: string | null
                  }
                  Update: {
                    "amount_paise"?: number,"appointment_id"?: string,"created_at"?: string,"customer_id"?: string,"expires_at"?: string,"id"?: string,"used_at"?: string | null,"used_order_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "consult_credits_appointment_id_fkey"
      columns: ["appointment_id"]
isOneToOne: true
      referencedRelation: "appointments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "consult_credits_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "consult_credits_used_order_id_fkey"
      columns: ["used_order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"consultations": {
                  Row: {
                    "appointment_id": string,"assessment": string | null,"chief_complaint": string | null,"completed_at": string | null,"consent_recorded": boolean,"created_at": string,"customer_id": string,"doctor_id": string,"follow_up_in_weeks": number | null,"follow_up_instructions": string | null,"id": string,"identity_verified": boolean,"mode": string,"observations": string | null,"private_notes": string | null,"started_at": string | null,"status": Database["public"]['Enums']["consultation_status"],"treatment_plan": string | null,"updated_at": string
                  }
                  Insert: {
                    "appointment_id": string,"assessment"?: string | null,"chief_complaint"?: string | null,"completed_at"?: string | null,"consent_recorded"?: boolean,"created_at"?: string,"customer_id": string,"doctor_id": string,"follow_up_in_weeks"?: number | null,"follow_up_instructions"?: string | null,"id"?: string,"identity_verified"?: boolean,"mode"?: string,"observations"?: string | null,"private_notes"?: string | null,"started_at"?: string | null,"status"?: Database["public"]['Enums']["consultation_status"],"treatment_plan"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "appointment_id"?: string,"assessment"?: string | null,"chief_complaint"?: string | null,"completed_at"?: string | null,"consent_recorded"?: boolean,"created_at"?: string,"customer_id"?: string,"doctor_id"?: string,"follow_up_in_weeks"?: number | null,"follow_up_instructions"?: string | null,"id"?: string,"identity_verified"?: boolean,"mode"?: string,"observations"?: string | null,"private_notes"?: string | null,"started_at"?: string | null,"status"?: Database["public"]['Enums']["consultation_status"],"treatment_plan"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "consultations_appointment_id_fkey"
      columns: ["appointment_id"]
isOneToOne: true
      referencedRelation: "appointments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "consultations_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "consultations_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctors"
      referencedColumns: ["id"]
    }
                  ]
                },"customers": {
                  Row: {
                    "age_years": number | null,"city": string | null,"created_at": string,"deleted_at": string | null,"email": string | null,"full_name": string | null,"gender": string | null,"id": string,"marketing_opt_in": boolean,"phone": string,"preferred_language": string,"profile_id": string | null,"state": string | null,"updated_at": string,"whatsapp_opt_in": boolean
                  }
                  Insert: {
                    "age_years"?: number | null,"city"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"email"?: string | null,"full_name"?: string | null,"gender"?: string | null,"id"?: string,"marketing_opt_in"?: boolean,"phone": string,"preferred_language"?: string,"profile_id"?: string | null,"state"?: string | null,"updated_at"?: string,"whatsapp_opt_in"?: boolean
                  }
                  Update: {
                    "age_years"?: number | null,"city"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"email"?: string | null,"full_name"?: string | null,"gender"?: string | null,"id"?: string,"marketing_opt_in"?: boolean,"phone"?: string,"preferred_language"?: string,"profile_id"?: string | null,"state"?: string | null,"updated_at"?: string,"whatsapp_opt_in"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "customers_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"data_requests": {
                  Row: {
                    "created_at": string,"customer_id": string,"details": string | null,"id": string,"kind": string,"resolved_at": string | null,"resolved_by": string | null,"status": string
                  }
                  Insert: {
                    "created_at"?: string,"customer_id": string,"details"?: string | null,"id"?: string,"kind": string,"resolved_at"?: string | null,"resolved_by"?: string | null,"status"?: string
                  }
                  Update: {
                    "created_at"?: string,"customer_id"?: string,"details"?: string | null,"id"?: string,"kind"?: string,"resolved_at"?: string | null,"resolved_by"?: string | null,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "data_requests_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "data_requests_resolved_by_fkey"
      columns: ["resolved_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"demo_state": {
                  Row: {
                    "id": string,"state": NonNullable<Json>,"updated_at": string,"version": number
                  }
                  Insert: {
                    "id": string,"state": NonNullable<Json>,"updated_at"?: string,"version"?: number
                  }
                  Update: {
                    "id"?: string,"state"?: NonNullable<Json>,"updated_at"?: string,"version"?: number
                  }
                  Relationships: [
                    
                  ]
                },"doctor_integrations": {
                  Row: {
                    "doctor_id": string,"google_calendar_id": string | null,"google_connected_at": string | null,"google_refresh_token_enc": string | null,"updated_at": string
                  }
                  Insert: {
                    "doctor_id": string,"google_calendar_id"?: string | null,"google_connected_at"?: string | null,"google_refresh_token_enc"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "doctor_id"?: string,"google_calendar_id"?: string | null,"google_connected_at"?: string | null,"google_refresh_token_enc"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "doctor_integrations_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: true
      referencedRelation: "doctors"
      referencedColumns: ["id"]
    }
                  ]
                },"doctors": {
                  Row: {
                    "bio_md": string | null,"booking_window_days": number,"buffer_minutes": number,"consultation_fee_paise": number,"created_at": string,"display_name": string,"id": string,"is_active": boolean,"max_per_day": number,"min_notice_minutes": number,"photo_path": string | null,"profile_id": string,"qualifications": string | null,"registration_council": string,"registration_no": string,"signature_path": string | null,"slot_minutes": number,"slug": string,"timezone": string,"updated_at": string
                  }
                  Insert: {
                    "bio_md"?: string | null,"booking_window_days"?: number,"buffer_minutes"?: number,"consultation_fee_paise"?: number,"created_at"?: string,"display_name": string,"id"?: string,"is_active"?: boolean,"max_per_day"?: number,"min_notice_minutes"?: number,"photo_path"?: string | null,"profile_id": string,"qualifications"?: string | null,"registration_council": string,"registration_no": string,"signature_path"?: string | null,"slot_minutes"?: number,"slug": string,"timezone"?: string,"updated_at"?: string
                  }
                  Update: {
                    "bio_md"?: string | null,"booking_window_days"?: number,"buffer_minutes"?: number,"consultation_fee_paise"?: number,"created_at"?: string,"display_name"?: string,"id"?: string,"is_active"?: boolean,"max_per_day"?: number,"min_notice_minutes"?: number,"photo_path"?: string | null,"profile_id"?: string,"qualifications"?: string | null,"registration_council"?: string,"registration_no"?: string,"signature_path"?: string | null,"slot_minutes"?: number,"slug"?: string,"timezone"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "doctors_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"domain_events": {
                  Row: {
                    "actor_id": string | null,"created_at": string,"entity": string,"entity_id": string | null,"error": string | null,"id": number,"payload": NonNullable<Json>,"processed_at": string | null,"type": string
                  }
                  Insert: {
                    "actor_id"?: string | null,"created_at"?: string,"entity": string,"entity_id"?: string | null,"error"?: string | null,"id"?: number,"payload"?: NonNullable<Json>,"processed_at"?: string | null,"type": string
                  }
                  Update: {
                    "actor_id"?: string | null,"created_at"?: string,"entity"?: string,"entity_id"?: string | null,"error"?: string | null,"id"?: number,"payload"?: NonNullable<Json>,"processed_at"?: string | null,"type"?: string
                  }
                  Relationships: [
                    
                  ]
                },"faqs": {
                  Row: {
                    "answer_md": string,"category": string,"id": string,"is_published": boolean,"question": string,"sort_order": number
                  }
                  Insert: {
                    "answer_md": string,"category"?: string,"id"?: string,"is_published"?: boolean,"question": string,"sort_order"?: number
                  }
                  Update: {
                    "answer_md"?: string,"category"?: string,"id"?: string,"is_published"?: boolean,"question"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"guarantee_claims": {
                  Row: {
                    "created_at": string,"customer_id": string,"customer_statement": string | null,"decided_at": string | null,"eligibility": NonNullable<Json>,"eligible": boolean | null,"enrollment_id": string,"id": string,"refund_amount_paise": number | null,"review_notes": string | null,"reviewed_by": string | null,"status": Database["public"]['Enums']["guarantee_claim_status"],"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"customer_id": string,"customer_statement"?: string | null,"decided_at"?: string | null,"eligibility"?: NonNullable<Json>,"eligible"?: boolean | null,"enrollment_id": string,"id"?: string,"refund_amount_paise"?: number | null,"review_notes"?: string | null,"reviewed_by"?: string | null,"status"?: Database["public"]['Enums']["guarantee_claim_status"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"customer_id"?: string,"customer_statement"?: string | null,"decided_at"?: string | null,"eligibility"?: NonNullable<Json>,"eligible"?: boolean | null,"enrollment_id"?: string,"id"?: string,"refund_amount_paise"?: number | null,"review_notes"?: string | null,"reviewed_by"?: string | null,"status"?: Database["public"]['Enums']["guarantee_claim_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "guarantee_claims_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "guarantee_claims_enrollment_id_fkey"
      columns: ["enrollment_id"]
isOneToOne: false
      referencedRelation: "guarantee_enrollments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "guarantee_claims_reviewed_by_fkey"
      columns: ["reviewed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"guarantee_enrollments": {
                  Row: {
                    "created_at": string,"customer_id": string,"first_order_id": string,"id": string,"policy_id": string,"started_on": string,"status": string,"updated_at": string,"void_reason": string | null
                  }
                  Insert: {
                    "created_at"?: string,"customer_id": string,"first_order_id": string,"id"?: string,"policy_id": string,"started_on": string,"status"?: string,"updated_at"?: string,"void_reason"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"customer_id"?: string,"first_order_id"?: string,"id"?: string,"policy_id"?: string,"started_on"?: string,"status"?: string,"updated_at"?: string,"void_reason"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "guarantee_enrollments_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "guarantee_enrollments_first_order_id_fkey"
      columns: ["first_order_id"]
isOneToOne: true
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "guarantee_enrollments_policy_id_fkey"
      columns: ["policy_id"]
isOneToOne: false
      referencedRelation: "guarantee_policies"
      referencedColumns: ["id"]
    }
                  ]
                },"guarantee_policies": {
                  Row: {
                    "claim_window_days": number,"created_at": string,"id": string,"is_active": boolean,"min_checkin_response_pct": number,"min_plan_months": number,"name": string,"published_at": string | null,"refund_percent": number,"require_followup_consult": boolean,"require_monthly_photos": boolean,"terms_md": string,"version": number
                  }
                  Insert: {
                    "claim_window_days": number,"created_at"?: string,"id"?: string,"is_active"?: boolean,"min_checkin_response_pct"?: number,"min_plan_months": number,"name": string,"published_at"?: string | null,"refund_percent": number,"require_followup_consult"?: boolean,"require_monthly_photos"?: boolean,"terms_md": string,"version": number
                  }
                  Update: {
                    "claim_window_days"?: number,"created_at"?: string,"id"?: string,"is_active"?: boolean,"min_checkin_response_pct"?: number,"min_plan_months"?: number,"name"?: string,"published_at"?: string | null,"refund_percent"?: number,"require_followup_consult"?: boolean,"require_monthly_photos"?: boolean,"terms_md"?: string,"version"?: number
                  }
                  Relationships: [
                    
                  ]
                },"intake_forms": {
                  Row: {
                    "allergies": string | null,"answers": NonNullable<Json>,"appointment_id": string,"concern_duration": string | null,"created_at": string,"current_medications": string | null,"current_products": string | null,"customer_id": string,"family_history": string | null,"id": string,"medical_history": string | null,"previous_treatments": string | null,"primary_concern": string | null,"submitted_at": string | null,"updated_at": string
                  }
                  Insert: {
                    "allergies"?: string | null,"answers"?: NonNullable<Json>,"appointment_id": string,"concern_duration"?: string | null,"created_at"?: string,"current_medications"?: string | null,"current_products"?: string | null,"customer_id": string,"family_history"?: string | null,"id"?: string,"medical_history"?: string | null,"previous_treatments"?: string | null,"primary_concern"?: string | null,"submitted_at"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "allergies"?: string | null,"answers"?: NonNullable<Json>,"appointment_id"?: string,"concern_duration"?: string | null,"created_at"?: string,"current_medications"?: string | null,"current_products"?: string | null,"customer_id"?: string,"family_history"?: string | null,"id"?: string,"medical_history"?: string | null,"previous_treatments"?: string | null,"primary_concern"?: string | null,"submitted_at"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "intake_forms_appointment_id_fkey"
      columns: ["appointment_id"]
isOneToOne: true
      referencedRelation: "appointments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "intake_forms_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    }
                  ]
                },"lead_activities": {
                  Row: {
                    "actor_id": string | null,"body": string | null,"created_at": string,"id": string,"kind": string,"lead_id": string,"meta": NonNullable<Json>
                  }
                  Insert: {
                    "actor_id"?: string | null,"body"?: string | null,"created_at"?: string,"id"?: string,"kind": string,"lead_id": string,"meta"?: NonNullable<Json>
                  }
                  Update: {
                    "actor_id"?: string | null,"body"?: string | null,"created_at"?: string,"id"?: string,"kind"?: string,"lead_id"?: string,"meta"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "lead_activities_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "lead_activities_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads"
      referencedColumns: ["id"]
    }
                  ]
                },"leads": {
                  Row: {
                    "assigned_to": string | null,"campaign": string | null,"created_at": string,"customer_id": string,"id": string,"last_contacted_at": string | null,"latest_scan_id": string | null,"lost_reason": string | null,"meta_lead_id": string | null,"next_action_at": string | null,"outcome": Database["public"]['Enums']["scan_outcome"] | null,"owner_claimed_at": string | null,"owner_name": string | null,"source": string | null,"stage": Database["public"]['Enums']["lead_stage"],"stage_changed_at": string,"updated_at": string,"utm": NonNullable<Json>
                  }
                  Insert: {
                    "assigned_to"?: string | null,"campaign"?: string | null,"created_at"?: string,"customer_id": string,"id"?: string,"last_contacted_at"?: string | null,"latest_scan_id"?: string | null,"lost_reason"?: string | null,"meta_lead_id"?: string | null,"next_action_at"?: string | null,"outcome"?: Database["public"]['Enums']["scan_outcome"] | null,"owner_claimed_at"?: string | null,"owner_name"?: string | null,"source"?: string | null,"stage"?: Database["public"]['Enums']["lead_stage"],"stage_changed_at"?: string,"updated_at"?: string,"utm"?: NonNullable<Json>
                  }
                  Update: {
                    "assigned_to"?: string | null,"campaign"?: string | null,"created_at"?: string,"customer_id"?: string,"id"?: string,"last_contacted_at"?: string | null,"latest_scan_id"?: string | null,"lost_reason"?: string | null,"meta_lead_id"?: string | null,"next_action_at"?: string | null,"outcome"?: Database["public"]['Enums']["scan_outcome"] | null,"owner_claimed_at"?: string | null,"owner_name"?: string | null,"source"?: string | null,"stage"?: Database["public"]['Enums']["lead_stage"],"stage_changed_at"?: string,"updated_at"?: string,"utm"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "leads_assigned_to_fkey"
      columns: ["assigned_to"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "leads_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: true
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "leads_latest_scan_id_fkey"
      columns: ["latest_scan_id"]
isOneToOne: false
      referencedRelation: "scans"
      referencedColumns: ["id"]
    }
                  ]
                },"media": {
                  Row: {
                    "appointment_id": string | null,"content_type": string | null,"created_at": string,"customer_id": string,"id": string,"kind": Database["public"]['Enums']["media_kind"],"storage_bucket": string,"storage_path": string,"taken_on": string | null,"uploaded_by": string | null
                  }
                  Insert: {
                    "appointment_id"?: string | null,"content_type"?: string | null,"created_at"?: string,"customer_id": string,"id"?: string,"kind": Database["public"]['Enums']["media_kind"],"storage_bucket"?: string,"storage_path": string,"taken_on"?: string | null,"uploaded_by"?: string | null
                  }
                  Update: {
                    "appointment_id"?: string | null,"content_type"?: string | null,"created_at"?: string,"customer_id"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["media_kind"],"storage_bucket"?: string,"storage_path"?: string,"taken_on"?: string | null,"uploaded_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "media_appointment_id_fkey"
      columns: ["appointment_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "media_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "media_uploaded_by_fkey"
      columns: ["uploaded_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"message_templates": {
                  Row: {
                    "body_preview": string,"buttons": NonNullable<Json>,"category": Database["public"]['Enums']["message_category"],"channel": Database["public"]['Enums']["message_channel"],"is_active": boolean,"key": string,"language": string,"provider_template_name": string | null,"updated_at": string,"variables": NonNullable<Json>
                  }
                  Insert: {
                    "body_preview": string,"buttons"?: NonNullable<Json>,"category": Database["public"]['Enums']["message_category"],"channel": Database["public"]['Enums']["message_channel"],"is_active"?: boolean,"key": string,"language"?: string,"provider_template_name"?: string | null,"updated_at"?: string,"variables"?: NonNullable<Json>
                  }
                  Update: {
                    "body_preview"?: string,"buttons"?: NonNullable<Json>,"category"?: Database["public"]['Enums']["message_category"],"channel"?: Database["public"]['Enums']["message_channel"],"is_active"?: boolean,"key"?: string,"language"?: string,"provider_template_name"?: string | null,"updated_at"?: string,"variables"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"messages": {
                  Row: {
                    "body": string | null,"category": Database["public"]['Enums']["message_category"] | null,"channel": Database["public"]['Enums']["message_channel"],"created_at": string,"customer_id": string | null,"delivered_at": string | null,"direction": Database["public"]['Enums']["message_direction"],"error": string | null,"from_address": string | null,"id": string,"payload": NonNullable<Json>,"provider_message_id": string | null,"read_at": string | null,"related_entity": string | null,"related_id": string | null,"sent_at": string | null,"status": Database["public"]['Enums']["message_status"],"template_key": string | null,"to_address": string | null
                  }
                  Insert: {
                    "body"?: string | null,"category"?: Database["public"]['Enums']["message_category"] | null,"channel": Database["public"]['Enums']["message_channel"],"created_at"?: string,"customer_id"?: string | null,"delivered_at"?: string | null,"direction": Database["public"]['Enums']["message_direction"],"error"?: string | null,"from_address"?: string | null,"id"?: string,"payload"?: NonNullable<Json>,"provider_message_id"?: string | null,"read_at"?: string | null,"related_entity"?: string | null,"related_id"?: string | null,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["message_status"],"template_key"?: string | null,"to_address"?: string | null
                  }
                  Update: {
                    "body"?: string | null,"category"?: Database["public"]['Enums']["message_category"] | null,"channel"?: Database["public"]['Enums']["message_channel"],"created_at"?: string,"customer_id"?: string | null,"delivered_at"?: string | null,"direction"?: Database["public"]['Enums']["message_direction"],"error"?: string | null,"from_address"?: string | null,"id"?: string,"payload"?: NonNullable<Json>,"provider_message_id"?: string | null,"read_at"?: string | null,"related_entity"?: string | null,"related_id"?: string | null,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["message_status"],"template_key"?: string | null,"to_address"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "messages_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "messages_template_key_fkey"
      columns: ["template_key"]
isOneToOne: false
      referencedRelation: "message_templates"
      referencedColumns: ["key"]
    }
                  ]
                },"order_items": {
                  Row: {
                    "dosage": string | null,"gst_rate": number | null,"hsn_code": string | null,"id": string,"instructions": string | null,"name_snapshot": string,"order_id": string,"product_id": string | null,"qty": number,"tax_paise": number | null,"taxable_paise": number | null,"unit_price_paise": number
                  }
                  Insert: {
                    "dosage"?: string | null,"gst_rate"?: number | null,"hsn_code"?: string | null,"id"?: string,"instructions"?: string | null,"name_snapshot": string,"order_id": string,"product_id"?: string | null,"qty": number,"tax_paise"?: number | null,"taxable_paise"?: number | null,"unit_price_paise"?: number
                  }
                  Update: {
                    "dosage"?: string | null,"gst_rate"?: number | null,"hsn_code"?: string | null,"id"?: string,"instructions"?: string | null,"name_snapshot"?: string,"order_id"?: string,"product_id"?: string | null,"qty"?: number,"tax_paise"?: number | null,"taxable_paise"?: number | null,"unit_price_paise"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "cancelled_at": string | null,"cgst_paise": number,"code": string,"consult_credit_paise": number,"created_at": string,"customer_id": string,"delivered_at": string | null,"discount_paise": number,"guarantee_eligible": boolean,"id": string,"igst_paise": number,"invoice_no": string | null,"invoice_path": string | null,"notes": string | null,"paid_at": string | null,"parent_order_id": string | null,"plan_end_on": string | null,"plan_id": string | null,"prices_include_tax": boolean,"recommendation_id": string | null,"sgst_paise": number,"shipping_address": Json | null,"shipping_paise": number,"source": Database["public"]['Enums']["order_source"],"status": Database["public"]['Enums']["order_status"],"subtotal_paise": number,"supply_days": number | null,"taxable_paise": number | null,"total_paise": number,"updated_at": string
                  }
                  Insert: {
                    "cancelled_at"?: string | null,"cgst_paise"?: number,"code"?: string,"consult_credit_paise"?: number,"created_at"?: string,"customer_id": string,"delivered_at"?: string | null,"discount_paise"?: number,"guarantee_eligible"?: boolean,"id"?: string,"igst_paise"?: number,"invoice_no"?: string | null,"invoice_path"?: string | null,"notes"?: string | null,"paid_at"?: string | null,"parent_order_id"?: string | null,"plan_end_on"?: string | null,"plan_id"?: string | null,"prices_include_tax"?: boolean,"recommendation_id"?: string | null,"sgst_paise"?: number,"shipping_address"?: Json | null,"shipping_paise"?: number,"source": Database["public"]['Enums']["order_source"],"status"?: Database["public"]['Enums']["order_status"],"subtotal_paise": number,"supply_days"?: number | null,"taxable_paise"?: number | null,"total_paise": number,"updated_at"?: string
                  }
                  Update: {
                    "cancelled_at"?: string | null,"cgst_paise"?: number,"code"?: string,"consult_credit_paise"?: number,"created_at"?: string,"customer_id"?: string,"delivered_at"?: string | null,"discount_paise"?: number,"guarantee_eligible"?: boolean,"id"?: string,"igst_paise"?: number,"invoice_no"?: string | null,"invoice_path"?: string | null,"notes"?: string | null,"paid_at"?: string | null,"parent_order_id"?: string | null,"plan_end_on"?: string | null,"plan_id"?: string | null,"prices_include_tax"?: boolean,"recommendation_id"?: string | null,"sgst_paise"?: number,"shipping_address"?: Json | null,"shipping_paise"?: number,"source"?: Database["public"]['Enums']["order_source"],"status"?: Database["public"]['Enums']["order_status"],"subtotal_paise"?: number,"supply_days"?: number | null,"taxable_paise"?: number | null,"total_paise"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "orders_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_parent_order_id_fkey"
      columns: ["parent_order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "plans"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_recommendation_fk"
      columns: ["recommendation_id"]
isOneToOne: false
      referencedRelation: "recommendations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_recommendation_fk"
      columns: ["recommendation_id"]
isOneToOne: false
      referencedRelation: "v_sales_recommendations"
      referencedColumns: ["id"]
    }
                  ]
                },"payments": {
                  Row: {
                    "amount_paise": number,"appointment_id": string | null,"captured_at": string | null,"created_at": string,"currency": string,"customer_id": string,"failure_reason": string | null,"id": string,"method": string | null,"order_id": string | null,"provider": string,"provider_order_id": string | null,"provider_payment_id": string | null,"provider_payment_link_id": string | null,"purpose": Database["public"]['Enums']["payment_purpose"],"raw": Json | null,"status": Database["public"]['Enums']["payment_status"],"updated_at": string
                  }
                  Insert: {
                    "amount_paise": number,"appointment_id"?: string | null,"captured_at"?: string | null,"created_at"?: string,"currency"?: string,"customer_id": string,"failure_reason"?: string | null,"id"?: string,"method"?: string | null,"order_id"?: string | null,"provider"?: string,"provider_order_id"?: string | null,"provider_payment_id"?: string | null,"provider_payment_link_id"?: string | null,"purpose": Database["public"]['Enums']["payment_purpose"],"raw"?: Json | null,"status"?: Database["public"]['Enums']["payment_status"],"updated_at"?: string
                  }
                  Update: {
                    "amount_paise"?: number,"appointment_id"?: string | null,"captured_at"?: string | null,"created_at"?: string,"currency"?: string,"customer_id"?: string,"failure_reason"?: string | null,"id"?: string,"method"?: string | null,"order_id"?: string | null,"provider"?: string,"provider_order_id"?: string | null,"provider_payment_id"?: string | null,"provider_payment_link_id"?: string | null,"purpose"?: Database["public"]['Enums']["payment_purpose"],"raw"?: Json | null,"status"?: Database["public"]['Enums']["payment_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payments_appointment_id_fkey"
      columns: ["appointment_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payments_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payments_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"plans": {
                  Row: {
                    "compare_at_paise": number | null,"created_at": string,"description_md": string | null,"gst_rate": number | null,"guarantee_eligible": boolean,"hsn_code": string | null,"id": string,"is_active": boolean,"is_recommended": boolean,"months": number,"name": string,"price_paise": number,"slug": string,"sort_order": number,"updated_at": string
                  }
                  Insert: {
                    "compare_at_paise"?: number | null,"created_at"?: string,"description_md"?: string | null,"gst_rate"?: number | null,"guarantee_eligible"?: boolean,"hsn_code"?: string | null,"id"?: string,"is_active"?: boolean,"is_recommended"?: boolean,"months": number,"name": string,"price_paise": number,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "compare_at_paise"?: number | null,"created_at"?: string,"description_md"?: string | null,"gst_rate"?: number | null,"guarantee_eligible"?: boolean,"hsn_code"?: string | null,"id"?: string,"is_active"?: boolean,"is_recommended"?: boolean,"months"?: number,"name"?: string,"price_paise"?: number,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"posts": {
                  Row: {
                    "author_doctor_id": string | null,"body_md": string,"cover_path": string | null,"created_at": string,"excerpt": string | null,"id": string,"medically_reviewed": boolean,"published_at": string | null,"seo": NonNullable<Json>,"slug": string,"status": string,"title": string,"updated_at": string
                  }
                  Insert: {
                    "author_doctor_id"?: string | null,"body_md"?: string,"cover_path"?: string | null,"created_at"?: string,"excerpt"?: string | null,"id"?: string,"medically_reviewed"?: boolean,"published_at"?: string | null,"seo"?: NonNullable<Json>,"slug": string,"status"?: string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "author_doctor_id"?: string | null,"body_md"?: string,"cover_path"?: string | null,"created_at"?: string,"excerpt"?: string | null,"id"?: string,"medically_reviewed"?: boolean,"published_at"?: string | null,"seo"?: NonNullable<Json>,"slug"?: string,"status"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "posts_author_doctor_id_fkey"
      columns: ["author_doctor_id"]
isOneToOne: false
      referencedRelation: "doctors"
      referencedColumns: ["id"]
    }
                  ]
                },"prescriptions": {
                  Row: {
                    "advice": string | null,"consultation_id": string,"created_at": string,"customer_id": string,"doctor_id": string,"doctor_registration_no": string,"id": string,"issued_at": string,"items": NonNullable<Json>,"pdf_path": string | null
                  }
                  Insert: {
                    "advice"?: string | null,"consultation_id": string,"created_at"?: string,"customer_id": string,"doctor_id": string,"doctor_registration_no": string,"id"?: string,"issued_at"?: string,"items"?: NonNullable<Json>,"pdf_path"?: string | null
                  }
                  Update: {
                    "advice"?: string | null,"consultation_id"?: string,"created_at"?: string,"customer_id"?: string,"doctor_id"?: string,"doctor_registration_no"?: string,"id"?: string,"issued_at"?: string,"items"?: NonNullable<Json>,"pdf_path"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "prescriptions_consultation_id_fkey"
      columns: ["consultation_id"]
isOneToOne: false
      referencedRelation: "consultations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "prescriptions_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "prescriptions_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctors"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "benefits": NonNullable<Json>,"created_at": string,"days_of_supply": number | null,"description_md": string | null,"gst_rate": number | null,"how_to_use_md": string | null,"hsn_code": string | null,"id": string,"images": NonNullable<Json>,"ingredients": NonNullable<Json>,"is_active": boolean,"name": string,"price_paise": number | null,"regulatory_category": Database["public"]['Enums']["regulatory_category"],"requires_consultation": boolean,"sku": string,"slug": string,"sort_order": number,"tagline": string | null,"updated_at": string
                  }
                  Insert: {
                    "benefits"?: NonNullable<Json>,"created_at"?: string,"days_of_supply"?: number | null,"description_md"?: string | null,"gst_rate"?: number | null,"how_to_use_md"?: string | null,"hsn_code"?: string | null,"id"?: string,"images"?: NonNullable<Json>,"ingredients"?: NonNullable<Json>,"is_active"?: boolean,"name": string,"price_paise"?: number | null,"regulatory_category"?: Database["public"]['Enums']["regulatory_category"],"requires_consultation"?: boolean,"sku": string,"slug": string,"sort_order"?: number,"tagline"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "benefits"?: NonNullable<Json>,"created_at"?: string,"days_of_supply"?: number | null,"description_md"?: string | null,"gst_rate"?: number | null,"how_to_use_md"?: string | null,"hsn_code"?: string | null,"id"?: string,"images"?: NonNullable<Json>,"ingredients"?: NonNullable<Json>,"is_active"?: boolean,"name"?: string,"price_paise"?: number | null,"regulatory_category"?: Database["public"]['Enums']["regulatory_category"],"requires_consultation"?: boolean,"sku"?: string,"slug"?: string,"sort_order"?: number,"tagline"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"email": string | null,"full_name": string | null,"id": string,"is_active": boolean,"phone": string | null,"role": Database["public"]['Enums']["app_role"],"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"email"?: string | null,"full_name"?: string | null,"id": string,"is_active"?: boolean,"phone"?: string | null,"role"?: Database["public"]['Enums']["app_role"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string | null,"full_name"?: string | null,"id"?: string,"is_active"?: boolean,"phone"?: string | null,"role"?: Database["public"]['Enums']["app_role"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"protocol_templates": {
                  Row: {
                    "concern": string | null,"created_at": string,"default_plan_id": string | null,"doctor_id": string | null,"follow_up_in_weeks": number | null,"id": string,"is_active": boolean,"items": NonNullable<Json>,"name": string,"updated_at": string
                  }
                  Insert: {
                    "concern"?: string | null,"created_at"?: string,"default_plan_id"?: string | null,"doctor_id"?: string | null,"follow_up_in_weeks"?: number | null,"id"?: string,"is_active"?: boolean,"items"?: NonNullable<Json>,"name": string,"updated_at"?: string
                  }
                  Update: {
                    "concern"?: string | null,"created_at"?: string,"default_plan_id"?: string | null,"doctor_id"?: string | null,"follow_up_in_weeks"?: number | null,"id"?: string,"is_active"?: boolean,"items"?: NonNullable<Json>,"name"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "protocol_templates_default_plan_id_fkey"
      columns: ["default_plan_id"]
isOneToOne: false
      referencedRelation: "plans"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "protocol_templates_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctors"
      referencedColumns: ["id"]
    }
                  ]
                },"recommendations": {
                  Row: {
                    "consult_credit_paise": number,"consultation_id": string,"created_at": string,"customer_id": string,"doctor_id": string,"expires_at": string | null,"id": string,"items": NonNullable<Json>,"opened_at": string | null,"order_id": string | null,"paid_at": string | null,"patient_note": string | null,"payment_link_id": string | null,"payment_link_url": string | null,"plan_id": string,"public_token": string,"sent_at": string | null,"status": Database["public"]['Enums']["recommendation_status"],"subtotal_paise": number,"total_paise": number,"updated_at": string
                  }
                  Insert: {
                    "consult_credit_paise"?: number,"consultation_id": string,"created_at"?: string,"customer_id": string,"doctor_id": string,"expires_at"?: string | null,"id"?: string,"items"?: NonNullable<Json>,"opened_at"?: string | null,"order_id"?: string | null,"paid_at"?: string | null,"patient_note"?: string | null,"payment_link_id"?: string | null,"payment_link_url"?: string | null,"plan_id": string,"public_token"?: string,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["recommendation_status"],"subtotal_paise": number,"total_paise": number,"updated_at"?: string
                  }
                  Update: {
                    "consult_credit_paise"?: number,"consultation_id"?: string,"created_at"?: string,"customer_id"?: string,"doctor_id"?: string,"expires_at"?: string | null,"id"?: string,"items"?: NonNullable<Json>,"opened_at"?: string | null,"order_id"?: string | null,"paid_at"?: string | null,"patient_note"?: string | null,"payment_link_id"?: string | null,"payment_link_url"?: string | null,"plan_id"?: string,"public_token"?: string,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["recommendation_status"],"subtotal_paise"?: number,"total_paise"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "recommendations_consultation_id_fkey"
      columns: ["consultation_id"]
isOneToOne: false
      referencedRelation: "consultations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "recommendations_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "recommendations_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "recommendations_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "recommendations_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "plans"
      referencedColumns: ["id"]
    }
                  ]
                },"refunds": {
                  Row: {
                    "amount_paise": number,"created_at": string,"guarantee_claim_id": string | null,"id": string,"initiated_by": string | null,"method": string,"payment_id": string,"payout_reference": string | null,"processed_at": string | null,"provider_refund_id": string | null,"reason": string,"status": Database["public"]['Enums']["refund_status"]
                  }
                  Insert: {
                    "amount_paise": number,"created_at"?: string,"guarantee_claim_id"?: string | null,"id"?: string,"initiated_by"?: string | null,"method"?: string,"payment_id": string,"payout_reference"?: string | null,"processed_at"?: string | null,"provider_refund_id"?: string | null,"reason": string,"status"?: Database["public"]['Enums']["refund_status"]
                  }
                  Update: {
                    "amount_paise"?: number,"created_at"?: string,"guarantee_claim_id"?: string | null,"id"?: string,"initiated_by"?: string | null,"method"?: string,"payment_id"?: string,"payout_reference"?: string | null,"processed_at"?: string | null,"provider_refund_id"?: string | null,"reason"?: string,"status"?: Database["public"]['Enums']["refund_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "refunds_guarantee_claim_fk"
      columns: ["guarantee_claim_id"]
isOneToOne: false
      referencedRelation: "guarantee_claims"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "refunds_initiated_by_fkey"
      columns: ["initiated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "refunds_payment_id_fkey"
      columns: ["payment_id"]
isOneToOne: false
      referencedRelation: "payments"
      referencedColumns: ["id"]
    }
                  ]
                },"reviews": {
                  Row: {
                    "body": string,"city": string | null,"consent_id": string | null,"created_at": string,"customer_id": string | null,"display_name": string,"has_before_after": boolean,"id": string,"media": NonNullable<Json>,"rating": number,"status": string,"verified_purchase": boolean
                  }
                  Insert: {
                    "body": string,"city"?: string | null,"consent_id"?: string | null,"created_at"?: string,"customer_id"?: string | null,"display_name": string,"has_before_after"?: boolean,"id"?: string,"media"?: NonNullable<Json>,"rating": number,"status"?: string,"verified_purchase"?: boolean
                  }
                  Update: {
                    "body"?: string,"city"?: string | null,"consent_id"?: string | null,"created_at"?: string,"customer_id"?: string | null,"display_name"?: string,"has_before_after"?: boolean,"id"?: string,"media"?: NonNullable<Json>,"rating"?: number,"status"?: string,"verified_purchase"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "reviews_consent_fk"
      columns: ["consent_id"]
isOneToOne: false
      referencedRelation: "consents"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    }
                  ]
                },"scan_photos": {
                  Row: {
                    "content_type": string,"created_at": string,"customer_id": string,"id": string,"metrics": NonNullable<Json>,"quality": NonNullable<Json>,"scan_id": string,"storage_path": string,"zone": string
                  }
                  Insert: {
                    "content_type"?: string,"created_at"?: string,"customer_id": string,"id"?: string,"metrics"?: NonNullable<Json>,"quality"?: NonNullable<Json>,"scan_id": string,"storage_path": string,"zone": string
                  }
                  Update: {
                    "content_type"?: string,"created_at"?: string,"customer_id"?: string,"id"?: string,"metrics"?: NonNullable<Json>,"quality"?: NonNullable<Json>,"scan_id"?: string,"storage_path"?: string,"zone"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "scan_photos_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "scan_photos_scan_id_fkey"
      columns: ["scan_id"]
isOneToOne: false
      referencedRelation: "scans"
      referencedColumns: ["id"]
    }
                  ]
                },"scans": {
                  Row: {
                    "analysis_version": string | null,"answers": NonNullable<Json>,"created_at": string,"customer_id": string,"id": string,"outcome": Database["public"]['Enums']["scan_outcome"] | null,"outcome_reasons": (string)[],"status": string,"submitted_at": string | null,"updated_at": string,"zones": NonNullable<Json>
                  }
                  Insert: {
                    "analysis_version"?: string | null,"answers"?: NonNullable<Json>,"created_at"?: string,"customer_id": string,"id"?: string,"outcome"?: Database["public"]['Enums']["scan_outcome"] | null,"outcome_reasons"?: (string)[],"status"?: string,"submitted_at"?: string | null,"updated_at"?: string,"zones"?: NonNullable<Json>
                  }
                  Update: {
                    "analysis_version"?: string | null,"answers"?: NonNullable<Json>,"created_at"?: string,"customer_id"?: string,"id"?: string,"outcome"?: Database["public"]['Enums']["scan_outcome"] | null,"outcome_reasons"?: (string)[],"status"?: string,"submitted_at"?: string | null,"updated_at"?: string,"zones"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "scans_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    }
                  ]
                },"scheduled_jobs": {
                  Row: {
                    "attempts": number,"created_at": string,"dedupe_key": string | null,"id": string,"kind": string,"last_error": string | null,"locked_at": string | null,"max_attempts": number,"payload": NonNullable<Json>,"run_at": string,"status": Database["public"]['Enums']["job_status"],"updated_at": string
                  }
                  Insert: {
                    "attempts"?: number,"created_at"?: string,"dedupe_key"?: string | null,"id"?: string,"kind": string,"last_error"?: string | null,"locked_at"?: string | null,"max_attempts"?: number,"payload"?: NonNullable<Json>,"run_at"?: string,"status"?: Database["public"]['Enums']["job_status"],"updated_at"?: string
                  }
                  Update: {
                    "attempts"?: number,"created_at"?: string,"dedupe_key"?: string | null,"id"?: string,"kind"?: string,"last_error"?: string | null,"locked_at"?: string | null,"max_attempts"?: number,"payload"?: NonNullable<Json>,"run_at"?: string,"status"?: Database["public"]['Enums']["job_status"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"settings": {
                  Row: {
                    "description": string | null,"is_public": boolean,"key": string,"updated_at": string,"updated_by": string | null,"value": NonNullable<Json>
                  }
                  Insert: {
                    "description"?: string | null,"is_public"?: boolean,"key": string,"updated_at"?: string,"updated_by"?: string | null,"value": NonNullable<Json>
                  }
                  Update: {
                    "description"?: string | null,"is_public"?: boolean,"key"?: string,"updated_at"?: string,"updated_by"?: string | null,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "settings_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"shipments": {
                  Row: {
                    "awb": string | null,"courier": string | null,"created_at": string,"delivered_at": string | null,"events": NonNullable<Json>,"expected_delivery_on": string | null,"id": string,"order_id": string,"provider": string,"provider_order_id": string | null,"provider_shipment_id": string | null,"shipped_at": string | null,"status": Database["public"]['Enums']["shipment_status"],"tracking_url": string | null,"updated_at": string
                  }
                  Insert: {
                    "awb"?: string | null,"courier"?: string | null,"created_at"?: string,"delivered_at"?: string | null,"events"?: NonNullable<Json>,"expected_delivery_on"?: string | null,"id"?: string,"order_id": string,"provider"?: string,"provider_order_id"?: string | null,"provider_shipment_id"?: string | null,"shipped_at"?: string | null,"status"?: Database["public"]['Enums']["shipment_status"],"tracking_url"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "awb"?: string | null,"courier"?: string | null,"created_at"?: string,"delivered_at"?: string | null,"events"?: NonNullable<Json>,"expected_delivery_on"?: string | null,"id"?: string,"order_id"?: string,"provider"?: string,"provider_order_id"?: string | null,"provider_shipment_id"?: string | null,"shipped_at"?: string | null,"status"?: Database["public"]['Enums']["shipment_status"],"tracking_url"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "shipments_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"tasks": {
                  Row: {
                    "assigned_to": string | null,"completed_at": string | null,"created_at": string,"created_by_system": boolean,"customer_id": string | null,"dedupe_key": string | null,"due_at": string | null,"id": string,"kind": string,"lead_id": string | null,"priority": number,"status": Database["public"]['Enums']["task_status"],"title": string,"updated_at": string
                  }
                  Insert: {
                    "assigned_to"?: string | null,"completed_at"?: string | null,"created_at"?: string,"created_by_system"?: boolean,"customer_id"?: string | null,"dedupe_key"?: string | null,"due_at"?: string | null,"id"?: string,"kind": string,"lead_id"?: string | null,"priority"?: number,"status"?: Database["public"]['Enums']["task_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "assigned_to"?: string | null,"completed_at"?: string | null,"created_at"?: string,"created_by_system"?: boolean,"customer_id"?: string | null,"dedupe_key"?: string | null,"due_at"?: string | null,"id"?: string,"kind"?: string,"lead_id"?: string | null,"priority"?: number,"status"?: Database["public"]['Enums']["task_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "tasks_assigned_to_fkey"
      columns: ["assigned_to"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "tasks_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "tasks_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads"
      referencedColumns: ["id"]
    }
                  ]
                },"webhook_events": {
                  Row: {
                    "error": string | null,"event_id": string,"event_type": string | null,"id": string,"payload": NonNullable<Json>,"processed_at": string | null,"provider": string,"received_at": string,"signature_valid": boolean
                  }
                  Insert: {
                    "error"?: string | null,"event_id": string,"event_type"?: string | null,"id"?: string,"payload": NonNullable<Json>,"processed_at"?: string | null,"provider": string,"received_at"?: string,"signature_valid": boolean
                  }
                  Update: {
                    "error"?: string | null,"event_id"?: string,"event_type"?: string | null,"id"?: string,"payload"?: NonNullable<Json>,"processed_at"?: string | null,"provider"?: string,"received_at"?: string,"signature_valid"?: boolean
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "v_daily_kpis": {
                  Row: {
                    "completed_consults": number | null,"consult_revenue_paise": number | null,"day": string | null,"new_leads": number | null,"order_revenue_paise": number | null,"paid_consults": number | null,"plans_from_consults": number | null,"reorders": number | null
                  }
                  Relationships: [
                    
                  ]
                },"v_lead_funnel": {
                  Row: {
                    "leads": number | null,"stage": Database["public"]['Enums']["lead_stage"] | null
                  }
                  Relationships: [
                    
                  ]
                },"v_sales_order_items": {
                  Row: {
                    "id": string | null,"name_snapshot": string | null,"order_id": string | null,"product_id": string | null,"qty": number | null,"unit_price_paise": number | null
                  }
                  Insert: {
                           "id"?: string | null,"name_snapshot"?: string | null,"order_id"?: string | null,"product_id"?: string | null,"qty"?: number | null,"unit_price_paise"?: number | null
                         }
                        Update: {
                           "id"?: string | null,"name_snapshot"?: string | null,"order_id"?: string | null,"product_id"?: string | null,"qty"?: number | null,"unit_price_paise"?: number | null
                         }
                        Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"v_sales_recommendations": {
                  Row: {
                    "consult_credit_paise": number | null,"created_at": string | null,"customer_id": string | null,"doctor_id": string | null,"expires_at": string | null,"id": string | null,"opened_at": string | null,"order_id": string | null,"paid_at": string | null,"plan_id": string | null,"sent_at": string | null,"status": Database["public"]['Enums']["recommendation_status"] | null,"subtotal_paise": number | null,"total_paise": number | null
                  }
                  Insert: {
                           "consult_credit_paise"?: number | null,"created_at"?: string | null,"customer_id"?: string | null,"doctor_id"?: string | null,"expires_at"?: string | null,"id"?: string | null,"opened_at"?: string | null,"order_id"?: string | null,"paid_at"?: string | null,"plan_id"?: string | null,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["recommendation_status"] | null,"subtotal_paise"?: number | null,"total_paise"?: number | null
                         }
                        Update: {
                           "consult_credit_paise"?: number | null,"created_at"?: string | null,"customer_id"?: string | null,"doctor_id"?: string | null,"expires_at"?: string | null,"id"?: string | null,"opened_at"?: string | null,"order_id"?: string | null,"paid_at"?: string | null,"plan_id"?: string | null,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["recommendation_status"] | null,"subtotal_paise"?: number | null,"total_paise"?: number | null
                         }
                        Relationships: [
                    {
      foreignKeyName: "recommendations_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "recommendations_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "recommendations_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "recommendations_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "plans"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "advance_lead_stage":
{ Args: { "p_customer_id": string,"p_reason"?: string,"p_stage": Database["public"]['Enums']["lead_stage"] }; Returns: Database["public"]['Enums']["lead_stage"]
                           },
"cancel_jobs":
{ Args: { "p_dedupe_prefix": string }; Returns: number
                           },
"capture_payment":
{ Args: { "p_amount_paise": number,"p_method"?: string,"p_provider_order_id": string,"p_provider_payment_id": string,"p_provider_payment_link_id": string,"p_raw"?: Json }; Returns: Json
                           },
"claim_jobs":
{ Args: { "p_limit"?: number }; Returns: {
              "attempts": number,
"created_at": string,
"dedupe_key": string | null,
"id": string,
"kind": string,
"last_error": string | null,
"locked_at": string | null,
"max_attempts": number,
"payload": NonNullable<Json>,
"run_at": string,
"status": Database["public"]['Enums']["job_status"],
"updated_at": string
            }[]
                          SetofOptions: {
        from: "*"
        to: "scheduled_jobs"
        isOneToOne: false
        isSetofReturn: true
      } },
"confirm_appointment_payment":
{ Args: { "p_appointment_id": string }; Returns: string
                           },
"current_app_role":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["app_role"]
                           },
"current_customer_id":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"current_doctor_id":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"emit_event":
{ Args: { "p_entity": string,"p_entity_id": string,"p_payload"?: Json,"p_type": string }; Returns: number
                           },
"expire_stale_holds":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"has_role":
{ Args: { "roles": (Database["public"]['Enums']["app_role"])[] }; Returns: boolean
                           },
"hold_slot":
{ Args: { "p_customer_id": string,"p_doctor_id": string,"p_fee_paise"?: number,"p_hold_minutes"?: number,"p_kind"?: Database["public"]['Enums']["appointment_kind"],"p_source"?: string,"p_starts_at": string }; Returns: {
              "booked_by": string | null,
"cancel_reason": string | null,
"cancelled_at": string | null,
"code": string,
"completed_at": string | null,
"created_at": string,
"customer_id": string,
"doctor_id": string,
"ends_at": string,
"external_calendar_event_id": string | null,
"fee_paise": number,
"hold_expires_at": string | null,
"id": string,
"intake_completed_at": string | null,
"join_url": string | null,
"kind": Database["public"]['Enums']["appointment_kind"],
"rescheduled_from_id": string | null,
"source": string,
"starts_at": string,
"status": Database["public"]['Enums']["appointment_status"],
"updated_at": string,
"video_provider": string | null,
"video_room": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "appointments"
        isOneToOne: true
        isSetofReturn: false
      } },
"is_staff":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"jwt_aal":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"lead_manual_stage_allowed":
{ Args: { "p_from": Database["public"]['Enums']["lead_stage"],"p_to": Database["public"]['Enums']["lead_stage"] }; Returns: boolean
                           },
"lead_stage_rank":
{ Args: { "s": Database["public"]['Enums']["lead_stage"] }; Returns: number
                           },
"mark_order_delivered":
{ Args: { "p_delivered_at"?: string,"p_order_id": string }; Returns: {
              "cancelled_at": string | null,
"cgst_paise": number,
"code": string,
"consult_credit_paise": number,
"created_at": string,
"customer_id": string,
"delivered_at": string | null,
"discount_paise": number,
"guarantee_eligible": boolean,
"id": string,
"igst_paise": number,
"invoice_no": string | null,
"invoice_path": string | null,
"notes": string | null,
"paid_at": string | null,
"parent_order_id": string | null,
"plan_end_on": string | null,
"plan_id": string | null,
"prices_include_tax": boolean,
"recommendation_id": string | null,
"sgst_paise": number,
"shipping_address": Json | null,
"shipping_paise": number,
"source": Database["public"]['Enums']["order_source"],
"status": Database["public"]['Enums']["order_status"],
"subtotal_paise": number,
"supply_days": number | null,
"taxable_paise": number | null,
"total_paise": number,
"updated_at": string
            }
                          SetofOptions: {
        from: "*"
        to: "orders"
        isOneToOne: true
        isSetofReturn: false
      } },
"mark_order_paid":
{ Args: { "p_order_id": string }; Returns: string
                           },
"set_lead_stage_manual":
{ Args: { "p_lead_id": string,"p_reason"?: string,"p_stage": Database["public"]['Enums']["lead_stage"] }; Returns: Database["public"]['Enums']["lead_stage"]
                           }
          }
          Enums: {
            "app_role": "customer"|"doctor"|"sales"|"ops"|"admin","appointment_kind": "first"|"follow_up","appointment_status": "held"|"booked"|"completed"|"no_show"|"cancelled"|"rescheduled"|"expired","consent_kind": "privacy_policy"|"terms"|"telemedicine"|"whatsapp_utility"|"whatsapp_marketing"|"photo_clinical_use"|"photo_marketing_use"|"guarantee_terms"|"review_publication"|"refund_policy","consultation_status": "draft"|"completed","guarantee_claim_status": "submitted"|"under_review"|"approved"|"rejected"|"refunded"|"withdrawn","job_status": "pending"|"running"|"done"|"failed"|"cancelled","lead_stage": "new"|"contacted"|"interested"|"consult_suggested"|"consult_link_sent"|"consult_booked"|"payment_successful"|"consult_completed"|"product_recommended"|"product_purchased"|"product_delivered"|"followup_active"|"reorder_due"|"reordered"|"lost","media_kind": "intake"|"progress"|"prescription"|"signature"|"other","message_category": "marketing"|"utility"|"authentication"|"service","message_channel": "whatsapp"|"sms"|"email","message_direction": "outbound"|"inbound","message_status": "queued"|"sent"|"delivered"|"read"|"failed"|"received","order_source": "shop"|"recommendation"|"reorder"|"subscription"|"manual","order_status": "pending_payment"|"paid"|"processing"|"shipped"|"delivered"|"cancelled"|"refunded"|"partially_refunded"|"rto","payment_purpose": "consultation"|"order","payment_status": "created"|"authorized"|"captured"|"failed"|"refunded"|"partially_refunded","recommendation_status": "draft"|"sent"|"paid"|"expired"|"declined"|"cancelled","refund_status": "pending"|"processed"|"failed","regulatory_category": "cosmetic"|"ayurvedic"|"drug"|"supplement"|"other","scan_outcome": "eligible"|"not_eligible"|"unclear","shipment_status": "created"|"pickup_scheduled"|"in_transit"|"out_for_delivery"|"delivered"|"ndr"|"rto_initiated"|"rto_delivered"|"cancelled"|"failed","task_status": "open"|"done"|"cancelled"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "app_role": ["customer", "doctor", "sales", "ops", "admin"],"appointment_kind": ["first", "follow_up"],"appointment_status": ["held", "booked", "completed", "no_show", "cancelled", "rescheduled", "expired"],"consent_kind": ["privacy_policy", "terms", "telemedicine", "whatsapp_utility", "whatsapp_marketing", "photo_clinical_use", "photo_marketing_use", "guarantee_terms", "review_publication", "refund_policy"],"consultation_status": ["draft", "completed"],"guarantee_claim_status": ["submitted", "under_review", "approved", "rejected", "refunded", "withdrawn"],"job_status": ["pending", "running", "done", "failed", "cancelled"],"lead_stage": ["new", "contacted", "interested", "consult_suggested", "consult_link_sent", "consult_booked", "payment_successful", "consult_completed", "product_recommended", "product_purchased", "product_delivered", "followup_active", "reorder_due", "reordered", "lost"],"media_kind": ["intake", "progress", "prescription", "signature", "other"],"message_category": ["marketing", "utility", "authentication", "service"],"message_channel": ["whatsapp", "sms", "email"],"message_direction": ["outbound", "inbound"],"message_status": ["queued", "sent", "delivered", "read", "failed", "received"],"order_source": ["shop", "recommendation", "reorder", "subscription", "manual"],"order_status": ["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled", "refunded", "partially_refunded", "rto"],"payment_purpose": ["consultation", "order"],"payment_status": ["created", "authorized", "captured", "failed", "refunded", "partially_refunded"],"recommendation_status": ["draft", "sent", "paid", "expired", "declined", "cancelled"],"refund_status": ["pending", "processed", "failed"],"regulatory_category": ["cosmetic", "ayurvedic", "drug", "supplement", "other"],"scan_outcome": ["eligible", "not_eligible", "unclear"],"shipment_status": ["created", "pickup_scheduled", "in_transit", "out_for_delivery", "delivered", "ndr", "rto_initiated", "rto_delivered", "cancelled", "failed"],"task_status": ["open", "done", "cancelled"]
          }
        }
} as const
