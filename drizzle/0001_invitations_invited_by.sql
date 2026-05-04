ALTER TABLE `invitations` ADD `invited_by` text REFERENCES `users`(`id`);
