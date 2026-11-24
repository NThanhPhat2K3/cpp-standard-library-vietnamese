---
id: chuong-06-phan-2
title: 'Chương 6 · list và forward_list'
sidebar_label: '06 · Phần 2: list và forward_list'
---

# 6.2.1 · `list` và `forward_list`

> **Phạm vi:** Phần còn lại của mục 6.2.1 về sequence container.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 173–176 (PDF trang 202–205). Các hộp ghi chú là phần bổ sung.

## `std::list`

Trước C++11, thư viện chuẩn có `std::list`; C++11 bổ sung `std::forward_list`. Trong sách, từ “list” thường chỉ `std::list`, dù một số đặc điểm cũng áp dụng cho forward list. `std::list` thường được triển khai như **danh sách liên kết đôi**: mỗi node liên kết tới phần tử trước và sau.

List không có truy cập ngẫu nhiên bằng chỉ số. Để đến một vị trí bất kỳ, thông thường cần đi qua các liên kết, nên thời gian tỉ lệ với khoảng cách. Bù lại, khi đã có iterator tới vị trí thích hợp, việc chèn hoặc xóa một phần tử tại đó có độ phức tạp hằng số; không cần dịch các phần tử phía sau như với vector.

:::note So sánh đúng chi phí
Tìm vị trí trong list vẫn có thể tốn thời gian tuyến tính. Ngoài số phép toán, cấp phát node và locality của bộ nhớ cũng ảnh hưởng hiệu năng thực tế; không nên chọn list chỉ dựa vào độ phức tạp của thao tác chèn.
:::

Ví dụ của sách tạo danh sách ký tự và in bằng range-based `for`:

```cpp
#include <iostream>
#include <list>

int main() {
    std::list<char> coll;
    for (char c = 'a'; c <= 'z'; ++c) {
        coll.push_back(c);
    }
    for (auto elem : coll) {
        std::cout << elem << ' ';
    }
    std::cout << '\n';
}
```

Ở đây `auto` suy luận `elem` là `char`. Có thể viết `for (char elem : coll)` tương đương. Mỗi `elem` là **bản sao**, nên sửa nó không sửa list. Muốn sửa phần tử gốc, dùng tham chiếu:

```cpp
for (auto& elem : coll) {
    // sửa elem sẽ sửa phần tử trong coll
}
```

Khi chỉ đọc các đối tượng có chi phí sao chép đáng kể, dùng `const auto&` giúp tránh sao chép:

```cpp
template <typename T>
void printElements(const T& coll) {
    for (const auto& elem : coll) {
        std::cout << elem << std::endl;
    }
}
```

Trước C++11, iterator thường được dùng để duyệt; sách giới thiệu chúng ở mục 6.3. Một cách khác được sách minh họa là vừa in vừa xóa phần tử đầu:

```cpp
while (!coll.empty()) {
    std::cout << coll.front() << ' ';
    coll.pop_front();
}
std::cout << '\n';
```

`empty()` kiểm tra container có rỗng; `front()` lấy phần tử đầu; `pop_front()` xóa phần tử đó nhưng **không trả lại nó**. Sau vòng lặp, list rỗng. Với tập ký tự ASCII, ví dụ in `a b c ... z`; trên bộ mã khác, vòng lặp từ `'a'` đến `'z'` không nhất thiết chỉ đi qua chữ cái, thậm chí có thể không chạy.

:::warning Kiểm tra rỗng
`front()` và `pop_front()` yêu cầu list không rỗng. Điều kiện `!coll.empty()` ở ví dụ là cần thiết cho việc truy cập và xóa an toàn.
:::

## `std::forward_list`

`forward_list` thường được triển khai như **danh sách liên kết đơn**: mỗi node chỉ liên kết tới phần tử kế tiếp. Nó tiết kiệm liên kết ngược nhưng không hỗ trợ duyệt lùi và không có những thao tác mà thiết kế không cung cấp với chi phí phù hợp, chẳng hạn `push_back()` hay `size()`.

Muốn xóa một phần tử hoặc chèn trước nó trong danh sách liên kết đơn, thao tác thường cần biết node đứng trước để cập nhật liên kết. Vì thế `forward_list` có các thao tác đặc biệt như `insert_after`, `erase_after` và vị trí `before_begin`; sách trình bày thêm ở mục 7.6.2.

```cpp
#include <forward_list>
#include <iostream>

int main() {
    std::forward_list<long> coll = {2, 3, 5, 7, 11, 13, 17};
    coll.resize(9);     // thêm hai phần tử được value-initialize thành 0
    coll.resize(10, 99); // thêm một phần tử 99
    for (auto elem : coll) {
        std::cout << elem << ' ';
    }
    std::cout << '\n';
}
```

Kết quả: `2 3 5 7 11 13 17 0 0 99`. Khi tăng kích thước, `resize(n)` tạo các phần tử mới bằng value-initialization; `resize(n, value)` dùng giá trị chỉ định. Thao tác này có thể tốn thời gian tuyến tính vì cần duyệt danh sách đến vị trí cần thiết. `std::array` không có `resize` vì kích thước cố định.

| Đặc điểm | `list` | `forward_list` |
|:---|:---|:---|
| Liên kết thường dùng | Hai chiều | Một chiều |
| Duyệt lùi | Có | Không |
| `push_back()` | Có | Không |
| `size()` | Có | Không |
| Chèn/xóa sau vị trí biết trước | Có các thao tác iterator tương ứng | Có `insert_after` / `erase_after` |
| Truy cập bằng `[]` | Không | Không |

Bảng là phần tóm tắt bổ sung. Các bảo đảm cụ thể về iterator, invalidation và độ phức tạp cần được xét theo từng phép toán trong Chương 7.
