---
id: chuong-05-phan-6
title: 'Chương 5 · shared_ptr và weak_ptr chi tiết'
sidebar_label: '05 · Phần 6: shared_ptr và weak_ptr chi tiết'
---

# 5.2.4 · `shared_ptr` và `weak_ptr` chi tiết

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 92–97 (PDF trang 121–126). Bảng dưới đây chuyển ngữ các bảng 5.3–5.6; ghi chú bổ sung được đánh dấu riêng.

## `shared_ptr`: sở hữu và con trỏ được lưu

`std::shared_ptr<T>` hỗ trợ quyền sở hữu chung; khi chủ sở hữu mạnh cuối cùng từ bỏ nhóm, deleter của nhóm được gọi. `T` có thể là `void`, cho phép chia sẻ quyền sở hữu mà không biểu thị kiểu đối tượng cụ thể qua con trỏ được lưu.

Cần phân biệt **nhóm sở hữu** và **con trỏ được lưu**, vì aliasing constructor cho phép chúng khác nhau. Một `shared_ptr` không sở hữu nhóm nào có `use_count() == 0`, nhưng vẫn có thể lưu con trỏ khác null. Ngược lại, một `shared_ptr` có thể lưu null mà vẫn có nhóm sở hữu và deleter.

Khi gán, `reset()` hoặc hủy một `shared_ptr`, nó từ bỏ nhóm cũ; deleter chỉ chạy nếu đó là chủ sở hữu mạnh cuối cùng. Deleter không được để ngoại lệ thoát ra. Các overload template cho phép chuyển đổi giữa các kiểu con trỏ tương thích. Constructor từ `weak_ptr` hết hiệu lực ném `std::bad_weak_ptr`.

### Tạo, gán và giải phóng

| Thao tác | Tác dụng |
|:---|:---|
| `shared_ptr<T> sp` hoặc `sp(nullptr)` | Tạo shared pointer rỗng. |
| `shared_ptr<T> sp(ptr)` | Tạo nhóm sở hữu mới cho `ptr` với deleter mặc định phù hợp. |
| `shared_ptr<T> sp(ptr, del)` | Tạo nhóm mới với deleter `del`. |
| `shared_ptr<T> sp(ptr, del, alloc)` | Tạo nhóm mới với deleter và allocator cho dữ liệu quản lý. |
| `shared_ptr<T> sp(nullptr, del[, alloc])` | Lưu null nhưng vẫn có thể tạo nhóm sở hữu với deleter. |
| `shared_ptr<T> sp(sp2)` | Sao chép, chia sẻ nhóm với `sp2`. |
| `shared_ptr<T> sp(std::move(sp2))` | Chuyển quyền sở hữu; `sp2` trở thành rỗng. |
| `shared_ptr<T> sp(sp2, ptr)` | Aliasing constructor: chia sẻ nhóm của `sp2`, lưu `ptr`. |
| `shared_ptr<T> sp(wp)` | Tạo chủ sở hữu mạnh từ weak pointer; ném nếu hết hiệu lực. |
| `shared_ptr<T> sp(std::move(up))` | Nhận quyền sở hữu từ `unique_ptr` phù hợp. |
| `sp = sp2`, `sp = std::move(sp2)` | Thay nhóm sở hữu bằng cách sao chép hoặc chuyển. |
| `sp = std::move(up)` | Nhận quyền sở hữu từ `unique_ptr` phù hợp. |
| `sp.swap(sp2)`, `swap(sp,sp2)` | Hoán đổi trạng thái hai smart pointer. |
| `sp.reset()` | Từ bỏ quyền sở hữu và trở thành rỗng. |
| `sp.reset(ptr[, del[, alloc]])` | Tạo nhóm mới cho `ptr` rồi thay trạng thái cũ. |
| `make_shared<T>(args...)` | Tạo đối tượng và nhóm sở hữu, chuyển các đối số để khởi tạo. |
| `allocate_shared<T>(alloc,args...)` | Tương tự, dùng allocator được cung cấp. |

*Bảng 5.3 của sách, trang 93.* Bảng gốc còn nêu chuyển từ `auto_ptr`; `auto_ptr` đã bị loại trong C++17. Destructor từ bỏ quyền sở hữu và chỉ gọi deleter khi đây là chủ sở hữu mạnh cuối cùng.

### Truy cập và thao tác khác

| Thao tác | Tác dụng |
|:---|:---|
| `sp.get()` | Lấy raw pointer được lưu. |
| `*sp`, `sp->member` | Truy cập qua con trỏ được lưu; phải hợp lệ cho thao tác. |
| `sp.use_count()` | Số `shared_ptr` cùng sở hữu nhóm; `0` nếu không có nhóm. |
| `sp.unique()` | Trong giao diện cũ, kiểm tra `use_count() == 1`. |
| `if (sp)` | Kiểm tra `sp.get() != nullptr`. |
| `sp1 == sp2`, `sp1 != sp2` và so sánh thứ tự | So sánh con trỏ được lưu theo quy tắc của các overload, không phải danh tính nhóm sở hữu. |
| `static_pointer_cast`, `dynamic_pointer_cast`, `const_pointer_cast` | Tạo shared pointer với phép chuyển kiểu tương ứng và chia sẻ nhóm phù hợp. |
| `get_deleter<D>(sp)` | Trả con trỏ tới deleter kiểu `D` nếu có thể tìm được, ngược lại null. |
| `stream << sp` | Xuất con trỏ được lưu, tương tự `stream << sp.get()`. |
| `sp.owner_before(other)` | Thứ tự yếu chặt theo nhóm sở hữu, dùng với shared hoặc weak pointer. |

*Bảng 5.4 của sách, trang 94.* `unique()` không còn trong `shared_ptr` từ C++20. `shared_ptr` không có `release()` để trả quyền sở hữu độc quyền cho bên gọi, vì có thể còn các chủ sở hữu khác.

`get_deleter` cần kiểu deleter làm đối số template; con trỏ nhận được chỉ hợp lệ khi deleter liên quan còn sống:

```cpp
auto del = [](int* p) { delete p; };
std::shared_ptr<int> p(new int, del);
auto* pd = std::get_deleter<decltype(del)>(p);
```

:::warning Không đồng nhất `bool` với quyền sở hữu
`if (sp)` chỉ kiểm tra `get()`, không kiểm tra `use_count()`. Có thể có `get() != nullptr` nhưng `use_count() == 0` khi alias từ một shared pointer rỗng; cũng có thể lưu `nullptr` mà vẫn có control block. Con trỏ khác null không tự bảo đảm đối tượng nó chỉ đến còn sống.
:::

### Aliasing constructor

Aliasing constructor hữu ích khi cần trỏ tới một thành viên nhưng giữ đối tượng bao ngoài sống:

```cpp
struct X { int a = 42; };
auto px = std::make_shared<X>();
std::shared_ptr<int> pi(px, &px->a);
px.reset();             // pi vẫn giữ X sống
std::cout << *pi;       // 42
```

`pi.get()` trỏ tới `a`, nhưng nhóm sở hữu của nó quản lý `X`. Tương tự có thể dùng với phần tử container hoặc ký hiệu trong thư viện động, nhưng lập trình viên phải bảo đảm con trỏ được lưu thực sự hợp lệ trong thời gian dùng. Ví dụ, một phần tử vector có thể bị di chuyển bởi tái cấp phát dù vector bao ngoài vẫn sống.

Aliasing **không** tiếp nhận quyền sở hữu đối tượng chỉ bởi đối số con trỏ thứ hai:

```cpp
auto sp1 = std::make_shared<X>();
std::shared_ptr<X> sp2(sp1, new X); // SAI: X thứ hai không được nhóm này xóa
```

Nếu alias từ một `shared_ptr` rỗng, kết quả cũng không sở hữu nhóm nào dù có thể lưu con trỏ khác null; người dùng vẫn chịu trách nhiệm về thời hạn sống của con trỏ đó.

### Tạo và chuyển kiểu

`make_shared` và `allocate_shared` giúp tạo đối tượng cùng control block; implementation thường có thể gộp cấp phát. `allocate_shared` nhận allocator. Trái với câu chữ đơn giản hóa trong sách, không nên coi số lần cấp phát hoặc lợi ích hiệu năng cụ thể là bảo đảm phổ quát. Constructor `shared_ptr` nhận raw pointer cũng có trách nhiệm gọi deleter phù hợp nếu không thể tạo control block; lợi ích an toàn của `make_shared` còn đến từ việc giảm quản lý raw pointer thủ công.

Không tạo chủ sở hữu mới từ con trỏ lấy ra rồi ép kiểu; dùng các hàm pointer cast để giữ cùng control block:

```cpp
std::shared_ptr<void> sp = std::make_shared<int>(42);
auto good = std::static_pointer_cast<int>(sp);
// std::shared_ptr<int> bad(static_cast<int*>(sp.get())); // SAI: nhóm mới
```

Đối số template là kiểu đích `int`, không phải `int*`; ví dụ in trong sách có nhầm lẫn ở điểm này. `dynamic_pointer_cast` trả `shared_ptr` rỗng nếu phép `dynamic_cast` tương ứng thất bại.

## `weak_ptr` chi tiết

`std::weak_ptr<T>` quan sát một nhóm sở hữu mà không làm tăng số chủ sở hữu mạnh. `use_count()` đếm các `shared_ptr`, không tính weak pointer. Weak pointer mặc định không có nhóm và `expired()` trả `true`; weak pointer cũng hết hiệu lực khi chủ sở hữu mạnh cuối cùng biến mất.

| Thao tác | Tác dụng |
|:---|:---|
| `weak_ptr<T> wp` | Tạo weak pointer rỗng. |
| `weak_ptr<T> wp(sp)` | Quan sát nhóm của shared pointer phù hợp. |
| `weak_ptr<T> wp(wp2)` | Sao chép weak pointer. |
| `wp = wp2`, `wp = sp` | Thay nhóm đang quan sát. |
| `wp.swap(wp2)`, `swap(wp,wp2)` | Hoán đổi trạng thái. |
| `wp.reset()` | Bỏ quan sát và trở thành rỗng. |
| `wp.use_count()` | Số chủ sở hữu mạnh hiện tại. |
| `wp.expired()` | Tương đương kiểm tra số chủ sở hữu mạnh bằng không. |
| `wp.lock()` | Tạo shared pointer cùng nhóm nếu còn sống; nếu không, trả rỗng. |
| `wp.owner_before(other)` | So sánh thứ tự nhóm sở hữu với weak hoặc shared pointer khác. |

*Bảng 5.5 của sách, trang 97.* Hủy hoặc reset một weak pointer không trực tiếp hủy đối tượng đang được các chủ sở hữu mạnh quản lý. Một `shared_ptr` do `lock()` tạo thành công tăng số chủ sở hữu mạnh trong thời gian nó tồn tại.

## Truy cập đồng thời

Cần phân biệt ba đối tượng: control block, từng biến smart pointer và đối tượng được trỏ tới. Các bản sao `shared_ptr` **khác nhau** có thể được thao tác đồng thời dù cùng chia sẻ control block. Nhưng đọc và ghi không đồng bộ **cùng một biến `shared_ptr`** khi có thao tác không const có thể gây data race; các thao tác trên đối tượng được trỏ tới cũng cần đồng bộ riêng.

C++11 cung cấp các hàm atomic cho `shared_ptr`:

```cpp
std::shared_ptr<X> global;

void publish() {
    auto local = std::make_shared<X>();
    std::atomic_store(&global, local);
}

auto local = std::atomic_load(&global);
```

| Hàm | Tác dụng |
|:---|:---|
| `atomic_is_lock_free(&sp)` | Hỏi thao tác atomic trên `sp` có lock-free hay không. |
| `atomic_load(&sp)` | Đọc một bản sao `sp` theo cách atomic. |
| `atomic_store(&sp, sp2)` | Gán `sp2` theo cách atomic. |
| `atomic_exchange(&sp, sp2)` | Trao đổi và lấy giá trị cũ theo cách atomic. |

*Bảng 5.6 của sách, trang 97.* Còn có các overload điều khiển memory order và compare-exchange. Mọi truy cập đồng thời tới cùng biến phải tuân thủ giao thức đồng bộ phù hợp; atomic đối với smart pointer không tự bảo vệ dữ liệu trong `*sp`.

:::note Góc nhìn hiện đại
Từ C++20 có `std::atomic<std::shared_ptr<T>>`; các hàm atomic tự do chuyên cho `shared_ptr` bị khuyến cáo không dùng từ C++20 và bị loại khỏi chuẩn C++26. `use_count()` chỉ là ảnh chụp tức thời, không phải cơ chế đồng bộ để tự suy luận rằng việc sửa đối tượng an toàn.
:::
