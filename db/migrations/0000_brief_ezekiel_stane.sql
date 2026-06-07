CREATE TABLE "challengeAttempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"challengeId" integer NOT NULL,
	"userId" integer NOT NULL,
	"score" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"creatorId" integer NOT NULL,
	"locationIds" jsonb NOT NULL,
	"totalRounds" integer DEFAULT 5 NOT NULL,
	"bestScore" integer DEFAULT 0 NOT NULL,
	"timesPlayed" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "challenges_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" serial PRIMARY KEY NOT NULL,
	"requesterId" integer NOT NULL,
	"addresseeId" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"mode" text DEFAULT 'classic' NOT NULL,
	"region" text DEFAULT 'worldwide' NOT NULL,
	"totalRounds" integer DEFAULT 5 NOT NULL,
	"currentRound" integer DEFAULT 0 NOT NULL,
	"totalScore" integer DEFAULT 0 NOT NULL,
	"maxPossibleScore" integer DEFAULT 25000 NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"isMultiplayer" boolean DEFAULT false NOT NULL,
	"lobbyCode" text,
	"challengeCode" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"completedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "leaderboardEntries" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"category" text NOT NULL,
	"score" integer NOT NULL,
	"region" text,
	"timeframe" text DEFAULT 'all_time' NOT NULL,
	"gameId" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lobbies" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"hostId" integer NOT NULL,
	"name" text NOT NULL,
	"region" text DEFAULT 'worldwide' NOT NULL,
	"mode" text DEFAULT 'classic' NOT NULL,
	"totalRounds" integer DEFAULT 5 NOT NULL,
	"roundTime" integer DEFAULT 120 NOT NULL,
	"allowMovement" boolean DEFAULT true NOT NULL,
	"isPublic" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'waiting' NOT NULL,
	"maxPlayers" integer DEFAULT 8 NOT NULL,
	"currentPlayers" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"startedAt" timestamp with time zone,
	"finishedAt" timestamp with time zone,
	CONSTRAINT "lobbies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "lobbyPlayers" (
	"id" serial PRIMARY KEY NOT NULL,
	"lobbyId" integer NOT NULL,
	"userId" integer NOT NULL,
	"isReady" boolean DEFAULT false NOT NULL,
	"isHost" boolean DEFAULT false NOT NULL,
	"totalScore" integer DEFAULT 0 NOT NULL,
	"joinedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"country" text NOT NULL,
	"city" text,
	"region" text NOT NULL,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"streetViewId" text,
	"imageUrl" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"timesPlayed" integer DEFAULT 0 NOT NULL,
	"avgScore" double precision DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"senderId" integer NOT NULL,
	"receiverId" integer,
	"lobbyId" integer,
	"content" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporterId" integer NOT NULL,
	"reportedId" integer NOT NULL,
	"reason" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"resolvedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"gameId" integer NOT NULL,
	"roundNumber" integer NOT NULL,
	"locationId" integer NOT NULL,
	"guessLat" double precision,
	"guessLng" double precision,
	"actualLat" double precision NOT NULL,
	"actualLng" double precision NOT NULL,
	"distance" double precision,
	"score" integer,
	"timeTaken" integer,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"completedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"unionId" text,
	"email" text,
	"username" text,
	"passwordHash" text,
	"name" text,
	"avatar" text,
	"country" text,
	"role" text DEFAULT 'user' NOT NULL,
	"rank" text DEFAULT 'bronze' NOT NULL,
	"eloRating" integer DEFAULT 1000 NOT NULL,
	"gamesPlayed" integer DEFAULT 0 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"totalScore" integer DEFAULT 0 NOT NULL,
	"bestScore" integer DEFAULT 0 NOT NULL,
	"averageDistance" double precision DEFAULT 0,
	"isOnline" boolean DEFAULT false NOT NULL,
	"lastActiveAt" timestamp with time zone DEFAULT now(),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_unionId_unique" UNIQUE("unionId"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "challengeAttempts" ADD CONSTRAINT "challengeAttempts_challengeId_challenges_id_fk" FOREIGN KEY ("challengeId") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challengeAttempts" ADD CONSTRAINT "challengeAttempts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_creatorId_users_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requesterId_users_id_fk" FOREIGN KEY ("requesterId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addresseeId_users_id_fk" FOREIGN KEY ("addresseeId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboardEntries" ADD CONSTRAINT "leaderboardEntries_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboardEntries" ADD CONSTRAINT "leaderboardEntries_gameId_games_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lobbies" ADD CONSTRAINT "lobbies_hostId_users_id_fk" FOREIGN KEY ("hostId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lobbyPlayers" ADD CONSTRAINT "lobbyPlayers_lobbyId_lobbies_id_fk" FOREIGN KEY ("lobbyId") REFERENCES "public"."lobbies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lobbyPlayers" ADD CONSTRAINT "lobbyPlayers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_users_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_users_id_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_lobbyId_lobbies_id_fk" FOREIGN KEY ("lobbyId") REFERENCES "public"."lobbies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_users_id_fk" FOREIGN KEY ("reporterId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reportedId_users_id_fk" FOREIGN KEY ("reportedId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_gameId_games_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_locationId_locations_id_fk" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;