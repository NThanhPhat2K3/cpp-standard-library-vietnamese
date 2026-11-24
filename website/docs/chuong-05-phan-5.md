---
id: chuong-05-phan-5
title: 'Chương 5 · Những lỗi khi dùng shared_ptr'
sidebar_label: '05 · Phần 5: Lỗi shared_ptr'
---

# 5.2.3 · Những lỗi khi dùng `shared_ptr`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 89–91 (PDF trang 118–120). Các hộp ghi chú là phần bổ sung.

`shared_ptr` giúp tự động quản lý tài nguyên nhưng không loại bỏ mọi lỗi. Mục trước đã thấy rằng vòng sở hữu mạnh có thể giữ các đối tượng sống mãi dù không còn đường truy cập từ bên ngoài. Một lỗi khác là tạo **nhiều nhóm sở hữu độc lập cho cùng một đối tượng**.

## Hai control block cho cùng raw pointer

```cpp
int* p = new int;
std::shared_ptr<int> sp1(p);
std::shared_ptr<int> sp2(p); // SAI: tạo nhóm sở hữu độc lập thứ hai
```

Mỗi constructor trên tạo một nhóm sở hữu riêng. Khi chủ sở hữu cuối cùng của từng nhóm biến mất, nhóm đó đều cố giải phóng cùng một con trỏ. Việc xóa lặp gây hành vi không xác định.

Hãy tạo một nhóm sở hữu rồi sao chép `shared_ptr` để các bản sao cùng chia sẻ nhóm ấy:

```cpp
auto sp1 = std::make_shared<int>(0);
std::shared_ptr<int> sp2(sp1); // đúng: cùng một nhóm sở hữu
```

Trong cách viết C++11 của sách cũng có thể tạo `sp1` trực tiếp từ `new int`, sau đó sao chép `sp1`. Điểm cốt lõi là **sao chép smart pointer**, không tạo smart pointer sở hữu mới từ raw pointer của đối tượng đã được quản lý.

:::warning Lưu ý
Không tạo `std::shared_ptr<T>(existing.get())` cho một đối tượng đã có `shared_ptr` sở hữu: nó tạo nhóm sở hữu độc lập, không chia sẻ control block của `existing`.
:::

## Không tạo `shared_ptr` sở hữu từ `this`

Lỗi tương tự có thể xuất hiện gián tiếp. Giả sử trong ví dụ `Person`, đối tượng con cần cập nhật liên kết đến cha mẹ và danh sách con của cha mẹ:

```cpp
void Person::setParentsAndTheirKids(std::shared_ptr<Person> m,
                                    std::shared_ptr<Person> f) {
    mother = m;
    father = f;
    if (m) m->kids.push_back(std::shared_ptr<Person>(this)); // SAI
    if (f) f->kids.push_back(std::shared_ptr<Person>(this)); // SAI
}
```

Tạo `shared_ptr<Person>(this)` không tìm nhóm sở hữu đã có; mỗi lần như vậy có thể tạo một control block riêng và cuối cùng xóa cùng đối tượng nhiều lần. Điều này vẫn sai nếu `kids` chứa `weak_ptr`: weak pointer được tạo từ một `shared_ptr` sở hữu tạm sai vẫn dựa trên nhóm sai đó.

Một phương án là truyền vào hàm một `shared_ptr` đã sở hữu đối tượng. Một phương án khác do thư viện cung cấp là kế thừa công khai từ `std::enable_shared_from_this<T>`:

```cpp
class Person : public std::enable_shared_from_this<Person> {
public:
    std::shared_ptr<Person> mother;
    std::shared_ptr<Person> father;
    std::vector<std::weak_ptr<Person>> kids;

    void setParentsAndTheirKids(std::shared_ptr<Person> m,
                                std::shared_ptr<Person> f) {
        mother = m;
        father = f;
        if (m) m->kids.push_back(shared_from_this());
        if (f) f->kids.push_back(shared_from_this());
    }
};
```

Khi đối tượng đã được một `shared_ptr` phù hợp quản lý, `shared_from_this()` tạo một `shared_ptr` **cùng nhóm sở hữu hiện có**, không mở nhóm mới. Ở ví dụ này `kids` là weak pointer để tránh tạo vòng sở hữu như mục 5.2.2.

## Không gọi `shared_from_this()` trong constructor

Trong quá trình constructor của đối tượng đang chạy, nhóm sở hữu thường chưa được kết nối với phần `enable_shared_from_this` của đối tượng. Do đó đoạn sau sai:

```cpp
Person::Person(std::shared_ptr<Person> m) {
    if (m) {
        m->kids.push_back(shared_from_this()); // không được dùng ở đây
    }
}
```

Cần tách việc tạo và liên kết thành hai bước:

```cpp
auto kid = std::make_shared<Person>();
kid->setParentsAndTheirKids(mom, dad);
```

Tương tự, không được gọi `shared_from_this()` trên đối tượng chưa được quản lý bởi một `shared_ptr` phù hợp. Trong C++ hiện đại, trường hợp không có nhóm sở hữu hợp lệ dẫn đến `std::bad_weak_ptr`. Sách nêu mã chương trình đầy đủ ở `util/enableshared1.cpp`.

:::note Góc nhìn hiện đại
Từ C++17, `weak_from_this()` cho phép lấy `weak_ptr` mà không ném khi chưa có nhóm sở hữu; nếu gọi trong constructor, weak pointer nhận được có thể rỗng và không tự biến thành hợp lệ về sau. Điều này không thay thế việc thiết kế hai giai đoạn khi cần liên kết tới đối tượng vừa tạo.
:::
