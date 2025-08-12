-- Ensure there's always a current_target row with id=1
INSERT INTO current_target (id, target_person) 
VALUES (1, NULL) 
ON CONFLICT (id) 
DO NOTHING;