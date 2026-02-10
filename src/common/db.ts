// IndexedDB không còn dùng nữa - đã chuyển sang localStorage
// import { openDB } from "idb";

const USED_NUMBERS = "used_numbers";
const GUARANTEED_NUMBERS = "guaranteed_numbers";
const VITECH_DB = "vitechgroup_db";

// Tạo hoặc mở cơ sở dữ liệu
export const initDB = async () => {
  // return openDB(VITECH_DB, 1, {
  //   upgrade(db) {
  //     if (!db.objectStoreNames.contains(USED_NUMBERS)) {
  //       db.createObjectStore(USED_NUMBERS, {
  //         keyPath: "id",
  //       });
  //     }

  //     if (!db.objectStoreNames.contains(GUARANTEED_NUMBERS)) {
  //       db.createObjectStore(GUARANTEED_NUMBERS, {
  //         keyPath: "id",
  //       });
  //     }
  //   },
  // });
  return Promise.resolve(null);
};

const getOneBaseDB = async (storeName: string, num: number) => {
  // const db = await initDB();
  // return db.getKey(storeName, num);
  return Promise.resolve(undefined);
};

export const addBaseDB = async (storeName: string, num: number) => {
  // const db = await initDB();
  // const isHas = await getOneBaseDB(storeName, num);
  // if (isHas !== undefined) return;
  // return db.add(storeName, {
  //   id: num,
  //   value: num,
  // });
  return Promise.resolve();
};

export const deleteBaseDB = async (storeName: string, num: number) => {
  // const db = await initDB();
  // return db.delete(storeName, num);
  return Promise.resolve();
};

export const deleteAllBaseDB = async (storeName: string) => {
    // const db = await initDB();
    // return db.clear(storeName);
    return Promise.resolve();
  };

export const getAllKeys = async (storeName: string) => {
  // const db = await initDB();
  // return db.getAllKeys(storeName);
  return Promise.resolve([]);
};


export const usedNumberDB = {
  add: async (num: number) => {
    return await addBaseDB(USED_NUMBERS, num);
  },
  findAll: async () => {
    return await getAllKeys(USED_NUMBERS);
  },
  findOne: async (num: number) => {
    return await getOneBaseDB(USED_NUMBERS, num);
  },
  delete: async (num: number) => {
    return await deleteBaseDB(USED_NUMBERS, num);
  },

  clearAll: async() => {
    return await deleteAllBaseDB(USED_NUMBERS)
  }
};

export const guaranteedNumberDB = {
  add: async (num: number) => {
    return await addBaseDB(GUARANTEED_NUMBERS, num);
  },
  findAll: async () => {
    return await getAllKeys(GUARANTEED_NUMBERS);
  },
  findOne: async (num: number) => {
    return await getOneBaseDB(GUARANTEED_NUMBERS, num);
  },
  delete: async (num: number) => {
    return await deleteBaseDB(GUARANTEED_NUMBERS, num);
  },
};
