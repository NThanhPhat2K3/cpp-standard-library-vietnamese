---
id: chuong-10-phan-5
title: 'Chương 10 · Adapter cũ và lambda'
sidebar_label: '10 · Phần 5: Adapter cũ và lambda'
---

# 10.2.4–10.3.2 · Adapter cũ và lambda

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 497–502 (PDF trang 526–531). Phần về adapter cũ được giữ để đọc mã lịch sử; ví dụ thực hành dùng lambda C++11.

## 10.2.4 Các adapter cũ

| Adapter trong sách | Vai trò lịch sử |
|:---|:---|
| `bind1st(op,arg)` | Gắn đối số thứ nhất, gọi `op(arg,x)`. |
| `bind2nd(op,arg)` | Gắn đối số thứ hai, gọi `op(x,arg)`. |
| `ptr_fun` | Bọc con trỏ hàm theo giao diện adapter cũ. |
| `mem_fun`, `mem_fun_ref` | Bọc hàm thành viên cho con trỏ hoặc đối tượng. |
| `not1`, `not2` | Phủ định predicate một hoặc hai đối số. |

Sách cũng nêu `unary_function` và `binary_function`, các lớp cơ sở cung cấp alias mà nhiều adapter cũ cần. Cách kết hợp này phụ thuộc những giao diện lịch sử; nên chọn `std::bind`, `std::mem_fn`, lambda hoặc `std::not_fn` tùy phiên bản và mục đích khi viết mã mới. Nhớ rằng phủ định comparator chặt không nhất thiết tạo comparator sắp xếp hợp lệ.

Ví dụ cũ tìm số chẵn đầu tiên bằng cách bind phép chia dư và phủ định kết quả. Lambda thể hiện trực tiếp điều kiện:

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{1, 3, 4, 6};
    auto firstEven = std::find_if(values.begin(), values.end(),
                                  [](int x) { return x % 2 == 0; });
    assert(firstEven != values.end() && *firstEven == 4);
}
```

Sách còn minh họa `ptr_fun` với hàm kiểm tra và `strcmp`, cùng `mem_fun_ref` để gọi `Person::print`. Hàm tự do có thể được truyền trực tiếp khi chữ ký phù hợp; lambda hoặc `mem_fn` có thể biểu đạt lời gọi thành viên mà không cần các adapter cũ.

## 10.3.1 Lambda so với binder

Lambda là cú pháp tạo callable cục bộ, có từ C++11. Cùng bốn phép trong ví dụ `bind` của sách:

```cpp
#include <iostream>

int main() {
    auto plus10 = [](int x) { return x + 10; };
    auto plus10times2 = [](int x) { return (x + 10) * 2; };
    auto cube = [](int x) { return x * x * x; };
    auto inverseDivide = [](double a, double b) { return b / a; };
    std::cout << plus10(7) << '\n' << plus10times2(7) << '\n'
              << cube(7) << '\n' << inverseDivide(49, 7) << '\n';
}
```

Kết quả `17`, `34`, `343`, khoảng `0.142857`. Lambda cho thấy trực tiếp đối số và phép tính; `bind` vẫn hữu ích khi cần gắn callable hoặc đối số theo nhu cầu cụ thể.

## 10.3.2 Lambda và trạng thái

Capture bằng tham chiếu cho phép lambda cập nhật trạng thái ngoài nó. Ví dụ tính trung bình của sách, có thêm kiểm tra phạm vi rỗng:

```cpp
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{1, 2, 3, 4, 5, 6, 7, 8};
    long long sum = 0;
    std::for_each(values.begin(), values.end(), [&sum](int x) { sum += x; });
    if (!values.empty())
        std::cout << "mean value: " << static_cast<double>(sum) / values.size() << '\n';
}
```

Kết quả là 4.5. Tổng được lưu ngoài lambda; functor có thể đóng gói tổng, số lượng và thao tác lấy trung bình thành một kiểu tái sử dụng. Cả hai cách đều cần quan tâm vòng đời, tràn số và dữ liệu rỗng.

Capture `[count]` tạo một bản sao `count` trong closure; `mutable` cho phép lời gọi sửa bản sao đó. Nếu thuật toán sao chép closure, mỗi bản sao có thể có bộ đếm riêng. Đây là cùng vấn đề với `Nth` trong ví dụ `remove_if` trước đó.

Capture `[&count]` cho các bản sao cùng tham chiếu bộ đếm ngoài, nhưng điều đó không biến predicate phụ thuộc số lần gọi thành cách tổng quát để chọn phần tử thứ ba: không nên dựa vào thứ tự và bản sao của thuật toán ngoài các bảo đảm của overload. Sách minh họa một implementation cho kết quả mong muốn với capture tham chiếu; để xóa theo vị trí, dùng iterator tới vị trí cần xóa như phần 10.1.4. Khi callable có thể chạy đồng thời, trạng thái chia sẻ cũng cần được đồng bộ.
