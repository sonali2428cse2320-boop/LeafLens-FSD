## Development demo data

After registering a development account, seed real MongoDB records for that user:

```bash
npm run seed:demo -- user@example.com
```

The command is idempotent, creates clearly identifiable demo plants and related care records, and refuses to run when `NODE_ENV=production`.