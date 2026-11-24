---
id: chuong-11-phan-9
title: 'Chương 11 · Copy và move phạm vi'
sidebar_label: '11 · Phần 9: Copy và move'
---

# 11.6.1–11.6.2 · Copy và move phạm vi

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 557–562 (PDF trang 586–591). Các lỗi trong mô tả ví dụ move được đính chính riêng.

## Các thuật toán copy

| Hàm | Hành vi | Kết quả |
|:---|:---|:---|
| `copy(first,last,out)` | Copy `[first,last)` theo chiều tiến. | Iterator ngay sau phần đích đã ghi. |
| `copy_if(first,last,out,pred)` | Copy các phần tử thỏa predicate theo thứ tự nguồn. | Iterator ngay sau phần đích đã ghi. |
| `copy_n(first,n,out)` | Copy `n` phần tử từ `first`. | Iterator ngay sau phần đích đã ghi. |
| `copy_backward(first,last,destEnd)` | Copy theo chiều lùi vào phạm vi kết thúc tại `destEnd`. | Iterator tới **đầu** phạm vi đích đã ghi. |

`copy_if` và `copy_n` có từ C++11. Các phạm vi phải hợp lệ và đích phải có đủ phần tử đã tồn tại, trừ khi dùng output iterator như `back_inserter` để chèn. Không mặc định source và destination được chồng lấp: `copy_if` yêu cầu các phạm vi không overlap; với `copy` và `copy_backward` cần tuân thủ quy tắc hướng dưới đây.

Sách nói chung các hàm trả vị trí sau phần đã ghi; riêng `copy_backward` trả **đầu** phạm vi đích, không phải cuối. `move_backward` cũng tương tự.

### Ví dụ copy vào list và in

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <list>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> source{"Hello", "this", "is", "an", "example"};
    std::list<std::string> dest;
    std::copy(source.cbegin(), source.cend(), std::back_inserter(dest));
    std::copy(dest.cbegin(), dest.cend(), std::ostream_iterator<std::string>(std::cout, " "));
    std::cout << '\n';
    std::copy(source.crbegin(), source.crend(), dest.begin());
    std::copy(dest.cbegin(), dest.cend(), std::ostream_iterator<std::string>(std::cout, " "));
    std::cout << '\n';
}
```

Kết quả là `Hello this is an example` và `example an is this Hello`. Lần copy đầu dùng inserter vì list rỗng; lần hai ghi đè năm phần tử đã tồn tại. Stream iterator cũng cho phép dùng `copy` để chuyển các từ từ input stream sang output stream.

### Khi hai vùng cùng một dãy

Để dịch vùng nguồn sang trái trong cùng mảng, `copy` theo chiều tiến có thể phù hợp khi `destBeg` không nằm trong `[first,last)`. Để dịch sang phải, dùng `copy_backward` với `destEnd` không nằm trong `(first,last]`. Điều kiện chính xác của overload phải được thỏa và toàn bộ vùng đích phải tồn tại.

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<char> left{'a','b','c','d','e','f','.'};
    std::copy(left.begin() + 1, left.begin() + 6, left.begin());
    assert((left == std::vector<char>{'b','c','d','e','f','f','.'}));
    std::vector<char> right{'a','b','c','d','e','f','.'};
    auto firstWritten = std::copy_backward(right.begin(), right.begin() + 5, right.end());
    assert(firstWritten == right.begin() + 2);
    assert((right == std::vector<char>{'a','b','a','b','c','d','e'}));
}
```

Ở ví dụ thứ hai, vùng đích `[2,7)` và nguồn `[0,5)` chồng lấp; ghi từ cuối tránh ghi đè phần tử chưa được đọc. Không nhầm iterator cuối đích với vị trí đầu đích.

## 11.6.2 `move` và `move_backward`

`std::move(first,last,out)` là **thuật toán ba đối số**, khác với hàm ép kiểu `std::move(value)` trong `<utility>`. Thuật toán gán từng phần tử nguồn như một rvalue vào đích khi overload tương ứng cho phép. `move_backward` làm việc tương tự theo chiều lùi và trả đầu phạm vi đích. Quy tắc về vùng đích, hướng chồng lấp và invalidation vẫn phải được xét.

Với kiểu thư viện chuẩn, đối tượng nguồn sau move thường còn hợp lệ nhưng giá trị không xác định cụ thể; chỉ thực hiện những thao tác có tiền điều kiện được thỏa. Với kiểu tự định nghĩa, tuân theo hợp đồng của kiểu. Move không nhất thiết nhanh hơn copy: nó phụ thuộc kiểu và có thể rơi về phép copy nếu chỉ overload copy khả dụng.

:::note Đính chính ví dụ sách
Trang 562 dùng `cbegin()`/`crbegin()` làm nguồn `std::move` và dùng `ostream_iterator` làm đích ghi. Iterator hằng thường tạo `const T&&`, không thể gọi move assignment thông thường nhận `T&&`; việc in qua stream cũng không tiêu thụ đối tượng nguồn theo nghĩa move. Vì vậy không thể kết luận các chuỗi trong ví dụ sách đã bị move hoặc có trạng thái không xác định sau lần in. Muốn move vào container khác, dùng nguồn không hằng và một đích có thao tác nhận rvalue phù hợp.
:::

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> source{"Hello", "world"};
    std::vector<std::string> dest;
    std::move(source.begin(), source.end(), std::back_inserter(dest));
    assert((dest == std::vector<std::string>{"Hello", "world"}));
    assert(source.size() == 2); // không giả định nội dung hai chuỗi sau move
}
```

Thuật toán move và move_backward có từ C++11. Sách cũng nhắc các biến thể khác như `reverse_copy`, `remove_copy_if`, `transform`, `replace_copy` và `partition_copy`; mỗi hàm có hợp đồng riêng về kết quả và phạm vi.

### Di chuyển sang phải bằng `move_backward`

Khi vùng đích nằm lệch sang phải và chồng lấp nguồn, `move_backward` thực hiện gán theo chiều lùi. Ví dụ dùng ba phần tử đầu làm nguồn và ba vị trí cuối làm đích:

```cpp
#include <algorithm>
#include <cassert>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> values{"A", "B", "C", "D", "E"};
    auto firstWritten = std::move_backward(values.begin(), values.begin() + 3,
                                           values.end());
    assert(firstWritten == values.begin() + 2);
    assert(values[2] == "A" && values[3] == "B" && values[4] == "C");
    // values[0] và values[1] còn hợp lệ nhưng không giả định nội dung.
}
```

Kết quả trả về là đầu vùng đích `[firstWritten, values.end())`. Ví dụ không đổi kích thước vector và không giả định các chuỗi nguồn sau move là rỗng. Nếu cần giữ dữ liệu nguồn, hãy dùng phép copy với điều kiện chồng lấp phù hợp thay vì move.
