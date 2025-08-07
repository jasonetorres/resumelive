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
         <TargetManager 
           currentTarget={currentTarget}
           onTargetChange={setCurrentTarget}
         />
         <LiveDisplay ratings={transformedRatings} />
        {/* Global floating reactions - work regardless of target */}
        <div className="fixed top-0 right-0 bg-yellow-500 text-black p-2 z-50">
          FloatingReactions should be here
        </div>
        <FloatingReactions currentTarget={null} />
       </div>
     </div>
   );