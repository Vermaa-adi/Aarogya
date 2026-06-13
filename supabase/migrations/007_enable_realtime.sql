-- Enable realtime for appointments and consult_notes
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table consult_notes;
