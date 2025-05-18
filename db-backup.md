# Restore Database from the Backup

1. Run the backup script:

   ```shell
    bun db-backup.ts
   ```

   The script will create a file `backup_<date>.dump` in `/backups` folder

1. Copy the created `.dump` file to the server temp folder
   ```shell
    scp ./backups/backup_<date>.dump  root@aowif.org:/tmp/
   ```
1. Copy the `.dump` file from the server `/tmp` folder to the Postgres Docker container `ugkwc0sgoso0wokss08sw8k8`

```shell
  docker cp /tmp/backup_<date>.dump ugkwc0sgoso0wokss08sw8k8:/backup_<date>.dump
```

1. Clear the `aowif` database on the Postgres server by deleting and recreating:
   ```
    psql -U cybervoid -d postgres
    DROP DATABASE awif;
    CREATE DATABASE awif;
    exit
   ```
1. Finalize the database restore in the Postgres Docker container

```shell
pg_restore -U cybervoid -d awif /backup_<date>.dump
```

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
