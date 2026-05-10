# استخدم نسخة نود حديثة
FROM node:20

# تثبيت ffmpeg داخل الحاوية
RUN apt-get update && apt-get install -y ffmpeg

# تحديد مكان العمل
WORKDIR /app

# نسخ ملفات المشروع
COPY package*.json pnpm-lock.yaml* ./

# تثبيت pnpm والمكتبات
RUN npm install -g pnpm && pnpm install

# نسخ بقية الكود
COPY . .

# تشغيل البوت
CMD ["pnpm", "start"]
