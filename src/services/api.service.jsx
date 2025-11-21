import apiAdmin from "./interceptor";

// Login User API
export const AdminLoginService = (data) => {
  return apiAdmin.post("/vendor/login", data);
};

export const getCategoriesservice = () => {
  return apiAdmin.get("/categories");
};

// subCategory

// products

export const createProductService = (data) => {
  return apiAdmin.post("/products", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const getProductService = () => {
  return apiAdmin.get("/products");
};

export const getByIdProductService = async (id) => {
  return apiAdmin.get(`/products/${id}`);
};
export const deleteProductService = async (id) => {
  return apiAdmin.delete(`/products/${id}`);
};

export const UpdateProductService = async (id, data) => {
  return apiAdmin.patch(`/products/${id}`, data);
};

export const getOrdersByVendorId = async () =>{
  return apiAdmin.get('/order/vendor')
}

export const updateOrderStatus = async (id,status) =>{
  return apiAdmin.patch('/order/update',{orderId:id,status:status})
}