# 🔄 Restore PostgreSQL Database from a Backup

1. **Run the backup script locally:**

   ```bash
   bun db-backup.ts
   ```

   This will create a file `backup_<date>.dump` in the `./backups` folder.

---

2. **Copy the `.dump` file to the server:**

   ```bash
   scp ./backups/backup_<date>.dump root@aowif.org:/tmp/
   ```

---

3. **Connect to the server via SSH (if not already):**

   ```bash
   ssh root@aowif.org
   ```

---

4. **Find the name of the Postgres Docker container (if unknown):**

   ```bash
   docker ps
   ```

## The current container name is `ugkwc0sgoso0wokss08sw8k8`

5. **Copy the `.dump` file into the container:**

   ```bash
   docker cp /tmp/backup_<date>.dump ugkwc0sgoso0wokss08sw8k8:/tmp/backup_<date>.dump
   ```

---

6. **Enter the Postgres container:**

   ```bash
   docker exec -it ugkwc0sgoso0wokss08sw8k8 bash
   ```

---

7. **Access PostgreSQL and drop the existing `awif` database:**

   ```bash
   psql -U cybervoid -d postgres
   ```

   Then run inside `psql`:

   ```sql
   DROP DATABASE IF EXISTS awif;
   CREATE DATABASE awif;
   \q
   ```

---

8. **Restore the database from the `.dump` file:**

   Still inside the container:

   ```bash
   pg_restore -U cybervoid -d awif /tmp/backup_<date>.dump
   ```

---

9. **Clean up temporary files:**

   After the restore is complete, remove the `.dump` file both from the container and from the server’s `/tmp` directory to keep things tidy:

   ```bash
   # Inside the container
   rm /tmp/backup_<date>.dump

   # On the host server
   rm /tmp/backup_<date>.dump
   ```
