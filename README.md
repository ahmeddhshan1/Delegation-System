# 🏛️ منظومة تسجيل الوفود والأعضاء لمعرض إيديكس
## EDEX Delegation Management System

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.13-38B2AC.svg)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> منظومة شاملة لإدارة المعارض العسكرية مع تركيز خاص على معرض إيديكس - تتبع الوفود، إدارة الأعضاء، وإنتاج التقارير

## 🌟 الميزات الرئيسية

### 🎯 إدارة الأحداث
- **الأحداث الرئيسية**: إنشاء وإدارة الأحداث الكبرى مثل معرض إيديكس
- **الأحداث الفرعية**: تنظيم الأحداث الفرعية تحت كل حدث رئيسي
- **إحصائيات ديناميكية**: تتبع عدد الوفود والأعضاء لكل حدث

### 👥 إدارة الوفود
- **أنواع الوفود**: عسكرية ومدنية
- **معلومات شاملة**: الجنسية، رئيس الوفد، عدد الأعضاء
- **تفاصيل الوصول**: المطار، شركة الطيران، رقم الرحلة، التاريخ، الوقت
- **حالات الوفود**: لم يغادر، غادر جزئياً، غادر بالكامل

### 🧑‍💼 إدارة الأعضاء
- **معلومات شخصية**: الرتبة، الاسم، الوظيفة
- **الوظائف المعادلة**: قاعدة بيانات شاملة من الوظائف العسكرية
- **حالات الأعضاء**: لم يغادر، غادر
- **ربط بالوفود**: كل عضو مرتبط بوفد محدد

### 📊 نظام التقارير
- **تقارير PDF**: بتصميم عربي احترافي
- **تصدير Excel**: مع عناوين عربية
- **تقارير شاملة**: تجمع الوفود والأعضاء
- **تقارير منفصلة**: لكل نوع على حدة

## 🛠️ التقنيات المستخدمة

### Frontend Stack
- **React 19.1.1** - مكتبة واجهة المستخدم
- **Vite 7.1.2** - أداة البناء والتطوير
- **Tailwind CSS 4.1.13** - إطار عمل CSS
- **TypeScript** - لغة البرمجة النوعية

### UI Components
- **Radix UI** - مكونات واجهة المستخدم القابلة لإعادة الاستخدام
- **shadcn/ui** - مكتبة مكونات UI حديثة
- **TanStack React Table** - جداول تفاعلية متقدمة
- **React Hook Form** - إدارة النماذج
- **Yup** - التحقق من صحة البيانات

### PDF & Export
- **@react-pdf/renderer** - إنشاء ملفات PDF
- **XLSX** - تصدير ملفات Excel
- **file-saver** - حفظ الملفات

### State Management
- **Redux Toolkit** - إدارة الحالة
- **React Redux** - ربط React مع Redux

## 🚀 البدء السريع

### المتطلبات الأساسية
- Node.js (الإصدار 18 أو أحدث)
- npm أو yarn

### التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/ahmeddhshan1/Delegation-System.git

# الانتقال إلى مجلد المشروع
cd Delegation-System/Delegation-Front

# تثبيت التبعيات
npm install

# تشغيل المشروع في وضع التطوير
npm run dev
```

### الأوامر المتاحة

```bash
# تشغيل المشروع
npm run dev

# بناء المشروع للإنتاج
npm run build

# معاينة البناء
npm run preview

# فحص الكود
npm run lint
```

## 📁 هيكل المشروع

```
Delegation-System/
└── Delegation-Front/
    ├── src/
    │   ├── components/          # المكونات الرئيسية
    │   │   ├── Auth/           # مكونات المصادقة
    │   │   ├── Delegations/    # إدارة الوفود
    │   │   ├── Events/         # إدارة الأحداث
    │   │   ├── Members/        # إدارة الأعضاء
    │   │   ├── PDF Templates/  # قوالب التقارير
    │   │   └── ui/             # مكونات UI الأساسية
    │   ├── pages/              # صفحات التطبيق
    │   ├── layouts/            # تخطيطات الصفحات
    │   ├── utils/              # الأدوات المساعدة
    │   ├── services/           # خدمات البيانات
    │   ├── hooks/              # React Hooks مخصصة
    │   ├── constants/          # الثوابت
    │   └── data/               # البيانات الافتراضية
    ├── public/                 # الملفات العامة
    │   ├── images/            # الصور
    │   └── fonts/             # الخطوط العربية
    ├── dist/                  # النسخة المبنيّة
    └── package.json           # إعدادات المشروع
```

## 🔐 نظام المصادقة والأذونات

### الأدوار المتاحة
- **Super Admin**: صلاحيات كاملة على جميع أجزاء النظام
- **Admin**: صلاحيات كاملة على الفرونت إند
- **User**: صلاحيات محدودة للعرض والإضافة

### نظام الحماية
- **Permission Guards**: حماية الصفحات حسب الصلاحيات
- **Role-based Access**: وصول حسب الدور
- **Component-level Security**: حماية على مستوى المكونات

## 📱 واجهة المستخدم

### التصميم
- **RTL Support**: دعم كامل للغة العربية
- **Responsive Design**: متجاوب مع جميع الأجهزة
- **Dark/Light Themes**: إمكانية تغيير الألوان
- **Modern UI**: واجهة عصرية وسهلة الاستخدام

### الميزات التفاعلية
- **Advanced Filtering**: فلترة متقدمة في الجداول
- **Search Functionality**: بحث شامل
- **Sorting & Pagination**: ترتيب وتقسيم الصفحات
- **Real-time Updates**: تحديث فوري للبيانات

## 📊 قاعدة البيانات

المشروع يستخدم **LocalStorage** لتخزين البيانات محلياً:

```javascript
// البيانات المخزنة
- mainEvents: الأحداث الرئيسية والفرعية
- delegations: جميع الوفود
- members: جميع الأعضاء
- militaryPositions: الوظائف العسكرية
- nationalities: الجنسيات
- userRole: دور المستخدم الحالي
```

## 🔄 سير العمل

1. **إنشاء حدث رئيسي** (مثل معرض إيديكس)
2. **إضافة أحداث فرعية** تحت الحدث الرئيسي
3. **تسجيل الوفود** لكل حدث فرعي
4. **إضافة أعضاء** لكل وفد
5. **تتبع حالات الوصول والمغادرة**
6. **إنتاج التقارير** حسب الحاجة

## 🎯 إمكانيات التطوير

### التطويرات المستقبلية
- **ربط Backend**: جاهز للاتصال بـ Django
- **API Integration**: بنية جاهزة للـ APIs
- **Database Migration**: يمكن ربطه بقاعدة بيانات حقيقية
- **Multi-language**: إمكانية إضافة لغات أخرى
- **Advanced Analytics**: إمكانية إضافة تحليلات متقدمة

### التحسينات المقترحة
- **PWA Support**: تطبيق ويب تقدمي
- **Offline Mode**: عمل بدون إنترنت
- **Real-time Collaboration**: تعاون فوري
- **Advanced Reporting**: تقارير أكثر تفصيلاً

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى:

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 👨‍💻 المطور

**أحمد ناجي** - [@ahmeddhshan1](https://github.com/ahmeddhshan1)

- **الإيميل**: ahmeddhshan1@gmail.com
- **GitHub**: [https://github.com/ahmeddhshan1](https://github.com/ahmeddhshan1)

## 🙏 شكر وتقدير

- **React Team** - لإطار العمل المذهل
- **Vite Team** - لأداة البناء السريعة
- **Tailwind CSS Team** - لإطار عمل CSS الرائع
- **جميع المساهمين** - لجهودهم في تطوير المكتبات المستخدمة

---

<div align="center">

### 🌟 إذا أعجبك المشروع، لا تنس إعطاؤه نجمة! ⭐

**تم تطويره بحب ❤️ لخدمة المعارض العسكرية المصرية**

</div>
