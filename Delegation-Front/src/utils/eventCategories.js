// قائمة الإيموجي المتاحة للفئات - معارض وأحداث عالمية
export const availableEmojis = [
  { icon: "Plane", name: "معرض الطيران العسكري", category: "عسكري" },
  { icon: "Zap", name: "مسابقة الفروسية العالمية", category: "رياضي" },
  { icon: "Rocket", name: "معرض الطائرات والفضاء", category: "فضائي" },
  { icon: "Gift", name: "مؤتمر عالمي", category: "مناسبات" },
  { icon: "Store", name: "معرض تجاري عالمي", category: "تجاري" },
  { icon: "Trophy", name: "بطولة رياضية دولية", category: "رياضي" },
  { icon: "Sparkles", name: "معرض التكنولوجيا", category: "تقني" },
  { icon: "Microscope", name: "مؤتمر علمي دولي", category: "علمي" },
  { icon: "Car", name: "معرض السيارات", category: "نقل" },
  { icon: "Hammer", name: "معرض الإنشاءات", category: "إنشائي" },
  { icon: "Factory", name: "معرض الصناعة", category: "صناعي" },
  { icon: "Heart", name: "مؤتمر طبي دولي", category: "طبي" },
  { icon: "GraduationCap", name: "مؤتمر تعليمي عالمي", category: "تعليمي" },
  { icon: "Banknote", name: "مؤتمر مالي دولي", category: "مالي" },
  { icon: "Music", name: "مهرجان موسيقي دولي", category: "فني" },
  { icon: "Palette", name: "معرض فني عالمي", category: "إبداعي" },
  { icon: "Camera", name: "مهرجان سينمائي", category: "إعلامي" },
  { icon: "MapPin", name: "معرض السياحة", category: "سياحي" },
  { icon: "Sprout", name: "معرض الزراعة", category: "زراعي" },
  { icon: "Leaf", name: "مؤتمر الطاقة المتجددة", category: "طبيعي" },
  { icon: "TreePine", name: "مؤتمر البيئة العالمي", category: "طبيعي" },
  { icon: "Star", name: "مناسبة دولية مهمة", category: "عام" },
  { icon: "Scale", name: "مؤتمر قانوني دولي", category: "قانون" },
  { icon: "BookOpen", name: "معرض الكتاب الدولي", category: "ثقافي" },
  { icon: "Film", name: "مهرجان مسرحي دولي", category: "ترفيهي" },
  { icon: "Joystick", name: "معرض الألعاب الإلكترونية", category: "ترفيه" },
  { icon: "Hospital", name: "مؤتمر صحي دولي", category: "طبي" },
  { icon: "UtensilsCrossed", name: "مهرجان الطعام العالمي", category: "غذائي" },
  { icon: "Droplet", name: "مؤتمر المياه العالمي", category: "طبيعي" },
  { icon: "Plane", name: "مؤتمر الطيران المدني", category: "نقل" },
  { icon: "Satellite", name: "مؤتمر الأقمار الصناعية", category: "فضائي" },
  { icon: "Shield", name: "مؤتمر الأمن السيبراني", category: "تقني" },
  { icon: "Smartphone", name: "معرض الهواتف الذكية", category: "تقني" },
  { icon: "Wrench", name: "معرض الهندسة", category: "تقني" },
  { icon: "Building", name: "استاد رياضي", category: "رياضي" },
  { icon: "Calendar", name: "مهرجان دولي", category: "مناسبات" },
  { icon: "Star", name: "حدث مميز", category: "عام" },
  { icon: "Flag", name: "مؤتمر وطني", category: "عام" },
  { icon: "Calendar", name: "مناسبة رسمية", category: "مناسبات" },
  { icon: "Handshake", name: "مؤتمر شراكات", category: "تجاري" },
  { icon: "Lightbulb", name: "مؤتمر ابتكار", category: "تقني" },
  { icon: "Shield", name: "مؤتمر أمني", category: "عسكري" }
];

// الفئات الافتراضية - فارغة للبداية
export const defaultCategories = [];

// الحصول على الفئات من localStorage
export const getEventCategories = () => {
  try {
    const stored = localStorage.getItem('eventCategories');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading event categories:', error);
  }
  return defaultCategories;
};

// حفظ الفئات في localStorage
export const saveEventCategories = (categories) => {
  try {
    localStorage.setItem('eventCategories', JSON.stringify(categories));
    return true;
  } catch (error) {
    console.error('Error saving event categories:', error);
    return false;
  }
};

// إضافة فئة جديدة
export const addEventCategory = (categoryData) => {
  const categories = getEventCategories();
  const newCategory = {
    id: `category_${Date.now()}`,
    name: categoryData.name,
    englishName: categoryData.englishName,
    icon: categoryData.icon,
    events: []
  };
  
  categories.push(newCategory);
  saveEventCategories(categories);
  return newCategory;
};

// إضافة حدث جديد لفئة معينة
export const addEventToCategory = (categoryId, eventData) => {
  const categories = getEventCategories();
  const category = categories.find(cat => cat.id === categoryId);
  
  if (category) {
    const newEvent = {
      id: `event_${Date.now()}`,
      name: eventData.name,
      date: new Date().toLocaleString(),
      delegationCount: 0,
      membersCount: 0
    };
    
    category.events.push(newEvent);
    saveEventCategories(categories);
    return newEvent;
  }
  
  return null;
};

// حذف فئة
export const deleteEventCategory = (categoryId) => {
  const categories = getEventCategories();
  const filtered = categories.filter(cat => cat.id !== categoryId);
  saveEventCategories(filtered);
  return filtered;
};

// حذف حدث من فئة
export const deleteEventFromCategory = (categoryId, eventId) => {
  const categories = getEventCategories();
  const category = categories.find(cat => cat.id === categoryId);
  
  if (category) {
    category.events = category.events.filter(event => event.id !== eventId);
    saveEventCategories(categories);
    return category.events;
  }
  
  return [];
};
