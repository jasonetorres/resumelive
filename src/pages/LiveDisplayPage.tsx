@@ .. @@
     // Subscribe to new ratings
     const ratingsChannel = supabase
       .channel('ratings-changes')
       .on(
         'postgres_changes',
         {
           event: 'INSERT',
           schema: 'public',
           table: 'ratings'
         },
         (payload) => {
           const newRating = payload.new as Rating;
-          // Only add if it's for the current target
-          if (newRating.target_person === currentTarget) {
+          // Only add real ratings (not quick reactions) if it's for the current target
+          if (newRating.target_person === currentTarget && newRating.overall !== null) {
             setRatings(prev => [newRating, ...prev]);
           }
         }
       )