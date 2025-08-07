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
          // Only add if it's for the current target AND it's a real rating (not a quick reaction)
          if (newRating.target_person === currentTarget && newRating.overall !== null && newRating.overall > 0) {
             setRatings(prev => [newRating, ...prev]);
           }
         }
       )
       .subscribe();

     return (
       <div>
         <TargetManager 
           currentTarget={currentTarget}
           onTargetChange={setCurrentTarget}
         />
         <LiveDisplay ratings={transformedRatings} />
        {/* Global floating reactions - work regardless of target */}
        <FloatingReactions currentTarget={null} />
       </div>
     </div>
   );