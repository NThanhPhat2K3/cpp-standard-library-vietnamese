---
id: chuong-05-phan-13
title: 'Chương 5 · Reference wrapper, function và min/max'
sidebar_label: '05 · Phần 13: Wrapper và min/max'
---

# 5.4.3–5.5.1 · Wrapper và hàm min/max

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 132–136 (PDF trang 161–165). Các hộp ghi chú là phần bổ sung.

## 5.4.3 Reference wrapper

`std::reference_wrapper<T>`, trong `<functional>`, là một đối tượng có thể sao chép nhưng tham chiếu tới một đối tượng khác. Nó hữu ích khi một API nhận đối số theo giá trị nhưng cần biểu diễn việc tham chiếu tới đối tượng ban đầu. `std::ref(x)` tạo wrapper tới `x`; `std::cref(x)` tạo wrapper tới `const x`.

```cpp
#include <functional>

int x = 0;
auto r = std::ref(x);
r.get() = 42; // thay đổi x
```

Wrapper có thể chuyển đổi sang `T&`; `get()` cũng trả tham chiếu đến đối tượng. Bản thân wrapper không sở hữu đối tượng và không kéo dài thời hạn sống của nó.

:::warning Đính chính về suy luận template
Sách nói với `template<class T> void foo(T val)`, lời gọi `foo(std::ref(x))` làm `T` thành `int&`. Thực tế, với tham số **theo giá trị** đó, `T` được suy luận là `std::reference_wrapper<int>`. Wrapper có thể chuyển đổi sang `int&` khi một ngữ cảnh yêu cầu tham chiếu; một số API như `make_tuple` còn có quy tắc riêng để mở wrapper thành reference. Không phải mọi function template đều tự mở wrapper.
:::

Thư viện dùng wrapper ở nhiều nơi: `make_pair` và `make_tuple` có thể tạo phần tử kiểu tham chiếu, binder có thể bind tham chiếu, và `std::thread` có thể truyền tham chiếu tới hàm luồng. Xem các mục 5.1.1, 5.1.2, 10.2.2 và 18.2.2 của sách.

Không thể tạo `std::vector<MyClass&>` vì reference không phải kiểu phần tử container phù hợp; có thể lưu wrapper:

```cpp
std::vector<std::reference_wrapper<MyClass>> items;
items.push_back(std::ref(obj));
items[0].get().work();
```

`obj` phải còn sống mỗi khi wrapper được dùng. Mục 7.11 bàn thêm về lưu tham chiếu trong container.

## 5.4.4 Function wrapper

`std::function<R(Args...)>` trong `<functional>` là wrapper đa hình cho callable có chữ ký phù hợp: hàm, function object, lambda hoặc member function pointer. Nó cho phép lưu các callable khác kiểu vào cùng một container:

```cpp
#include <functional>
#include <vector>

void func(int x, int y);
std::vector<std::function<void(int, int)>> tasks;
tasks.push_back(func);
tasks.push_back([](int x, int y) { /* ... */ });
for (const auto& f : tasks) {
    f(33, 66);
}
```

Với member function pointer, đối tượng đích là đối số đầu tiên:

```cpp
class C {
public:
    void memfunc(int x, int y) const;
};

std::function<void(const C&, int, int)> mf = &C::memfunc;
mf(C(), 42, 77);
```

`std::function` cũng có thể dùng làm kiểu trả về khi hàm cần trả callable với một chữ ký chung. Wrapper mặc định rỗng; gọi khi chưa có target ném `std::bad_function_call`:

```cpp
std::function<void(int, int)> f;
// f(33, 66); // ném std::bad_function_call
if (f) f(33, 66); // chỉ gọi nếu có target
```

:::note Góc nhìn hiện đại
`std::function` dùng type erasure và trong các phiên bản được sách xét yêu cầu target có thể sao chép. Nếu không cần lưu nhiều kiểu callable dưới một kiểu chung, template hoặc `auto` có thể giữ kiểu cụ thể. C++23 bổ sung `std::move_only_function` cho các tình huống cần wrapper chỉ move.
:::

## 5.5 Hàm tiện ích

Thư viện chuẩn có các hàm nhỏ để tìm giá trị nhỏ/lớn nhất, hoán đổi và bổ sung toán tử so sánh. Phần này bắt đầu với `min`, `max` và `minmax` trong `<algorithm>`.

### 5.5.1 Tìm min và max

| Hàm | Kết quả |
|:---|:---|
| `min(a,b)` / `min(a,b,cmp)` | Giá trị nhỏ hơn theo `<` hoặc `cmp`. |
| `min({a,b,...})` / `min({a,b,...},cmp)` | Giá trị nhỏ nhất trong initializer list. |
| `max(a,b)` / `max(a,b,cmp)` | Giá trị lớn hơn theo `<` hoặc `cmp`. |
| `max({a,b,...})` / `max({a,b,...},cmp)` | Giá trị lớn nhất trong initializer list. |
| `minmax(a,b)` / `minmax(a,b,cmp)` | Pair chứa min và max của hai đối số. |
| `minmax({a,b,...})` / `minmax({a,b,...},cmp)` | Pair chứa min và max của danh sách. |

*Bảng 5.18, trang 134.* Các overload initializer list và `minmax` có từ C++11. Danh sách truyền cho những overload này phải không rỗng.

Với hai đối số tương đương, `min` và `max` trả đối số đầu; `minmax(a,b)` trả thứ tự `(a,b)`. Với danh sách, `min` và `max` chọn phần tử đầu tiên trong các phần tử cực trị tương đương; `minmax` chọn min đầu tiên và max cuối cùng. Tác giả khuyên không nên dựa vào chi tiết này nếu không cần.

Một khác biệt quan trọng là overload **hai đối số** trả tham chiếu, còn overload initializer list trả giá trị. `minmax(a,b)` trả pair chứa các tham chiếu; `minmax({a,b,...})` trả pair chứa giá trị.

:::warning Thời hạn sống
Không giữ tham chiếu trả về từ overload hai đối số nếu đối số được chọn là một đối tượng tạm đã hết thời hạn sống. Ví dụ `const int& r = std::min(1, 2);` để lại tham chiếu treo sau câu lệnh. Gán vào giá trị `int r = std::min(1, 2);` an toàn hơn trong trường hợp này.
:::

Có thể cung cấp comparator để định nghĩa thứ tự. Ví dụ sách so sánh **giá trị được trỏ tới**, không phải địa chỉ:

```cpp
#include <algorithm>
#include <utility>

bool int_ptr_less(int* a, int* b) {
    return *a < *b;
}

int x = 17, y = 42, z = 33;
int *px = &x, *py = &y, *pz = &z;
int* pmax = std::max(px, py, int_ptr_less); // trỏ tới y
std::pair<int*, int*> extremes =
    std::minmax({px, py, pz}, int_ptr_less); // trỏ tới x và y
```

Comparator phải nhận các giá trị hợp lệ; trong ví dụ các con trỏ đều không null và trỏ đến đối tượng còn sống. Có thể viết lambda thay cho hàm riêng:

```cpp
auto extremes = std::minmax({px, py, pz},
    [](int* a, int* b) { return *a < *b; });
```

Các đối số trong overload thông thường phải có kiểu template được suy luận phù hợp. Với `int i` và `long l`, `std::max(i,l)` và `std::max({i,l})` không tự suy luận được cùng `T`. Có thể chỉ định kiểu khi chuyển đổi phù hợp:

```cpp
std::max<long>(i, l);
std::max<long>({i, l});
```

Trong trường hợp overload hai đối số, nếu một đối số phải chuyển thành đối tượng tạm kiểu `long`, không giữ tham chiếu trả về vượt quá biểu thức đầy đủ. Comparator cần thỏa yêu cầu thứ tự của thuật toán; sách giải thích function object sâu hơn ở mục 6.10.
