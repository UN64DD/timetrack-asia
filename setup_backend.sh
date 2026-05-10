#!/bin/bash
mkdir -p backend/src/config
mkdir -p backend/src/middleware
mkdir -p backend/src/utils
mkdir -p backend/src/database
for module in auth users roles events categories registrations participants payments csv_exports media_uploads results analytics audit_logs; do
  mkdir -p backend/src/modules/$module/controllers
  mkdir -p backend/src/modules/$module/services
  mkdir -p backend/src/modules/$module/routes
  mkdir -p backend/src/modules/$module/models
done
cd backend
npm init -y
npm install express cors dotenv jsonwebtoken bcrypt pg express-validator
npm install -D typescript @types/express @types/cors @types/node @types/jsonwebtoken @types/bcrypt @types/pg ts-node-dev
npx tsc --init
