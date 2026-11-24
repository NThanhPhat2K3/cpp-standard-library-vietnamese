---
id: chuong-09-phan-5
title: 'Chương 9 · Stream iterator và move iterator'
sidebar_label: '09 · Phần 5: Stream và move iterator'
---

# 9.4.3–9.4.4 · Stream iterator và move iterator

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 460–466 (PDF trang 489–495). Các điểm cần thận trọng được nêu riêng.

## `ostream_iterator`

`std::ostream_iterator<T>` là output iterator ghi mỗi giá trị vào stream bằng `operator<<`. Constructor nhận stream và có thể nhận chuỗi phân cách kiểu `const char*`; chuỗi đó được ghi **sau mỗi giá trị**, kể cả giá trị cuối. Không truyền con trỏ tới chuỗi đã hết vòng đời.

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <vector>

int main() {
    std::ostream_iterator<int> writer(std::cout, "\n");
    *writer = 42; ++writer;
    *writer = 77; ++writer;
    *writer = -5;
    std::vector<int> values{1, 2, 3, 4, 5, 6, 7, 8, 9};
    std::copy(values.cbegin(), values.cend(), std::ostream_iterator<int>(std::cout));
    std::cout << '\n';
    std::copy(values.cbegin(), values.cend(), std::ostream_iterator<int>(std::cout, " < "));
    std::cout << '\n';
}
```

Sau ba dòng `42`, `77`, `-5`, chương trình in `123456789`, rồi `1 < 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < `. Nếu delimiter là `std::string`, có thể truyền `delimiter.c_str()` miễn là chuỗi và vùng dữ liệu của nó còn hợp lệ trong suốt thời gian iterator sử dụng. Kiểm tra trạng thái stream nếu cần biết việc ghi có thành công.

## `istream_iterator`

`std::istream_iterator<T>` là input iterator dùng `operator>>` để đọc giá trị kiểu `T`. Iterator mặc định là dấu kết thúc; iterator gắn với stream trở thành end-of-stream khi đọc thất bại, bao gồm EOF hoặc lỗi định dạng. Không dereference iterator kết thúc.

```cpp
#include <iostream>
#include <iterator>

int main() {
    std::istream_iterator<int> reader(std::cin), end;
    while (reader != end) {
        std::cout << "once: " << *reader << '\n';
        std::cout << "once again: " << *reader << '\n';
        ++reader;
    }
}
```

Với đầu vào `1 2 3 f 4`, chương trình in hai lần từng số 1, 2, 3 rồi dừng vì `f` không đọc được thành `int`. Hai lần dereference trước khi tăng đọc cùng giá trị đã lưu; `++reader` yêu cầu đọc giá trị tiếp theo.

:::note Đính chính cách diễn đạt trong sách
Iterator được gắn với stream đã tồn tại; nó không tự mở file hay mở stream. Constructor gắn stream có thể thực hiện phép đọc đầu tiên, nên đừng tạo nó quá sớm nếu thời điểm tiêu thụ đầu vào quan trọng. Input iterator chỉ bảo đảm duyệt một lượt: không dựa vào các bản sao để đọc stream độc lập.
:::

## Đọc mỗi từ thứ ba an toàn

Sách minh họa dùng `advance(reader,2)` rồi kiểm tra EOF. Tuy nhiên nếu chỉ còn một từ, `advance` có thể cố tăng end-of-stream iterator ở bước thứ hai; kiểm tra **sau** lời gọi không tránh được vi phạm. Kiểm tra trước từng bước:

```cpp
#include <iostream>
#include <iterator>
#include <string>

int main() {
    std::istream_iterator<std::string> in(std::cin), end;
    std::ostream_iterator<std::string> out(std::cout, " ");
    while (in != end) {
        ++in; if (in == end) break;
        ++in; if (in == end) break;
        *out++ = *in++;
    }
    std::cout << '\n';
}
```

Với chuỗi trong sách `No one objects if you are doing a good programming job for someone whom you respect.`, kết quả là `objects are good for you`. Các đoạn cuối thiếu đủ ba từ được bỏ qua mà không tăng iterator đã kết thúc.

## 9.4.4 Move iterator

`std::make_move_iterator(it)` tạo adapter để truy cập phần tử nguồn theo cách cho phép thuật toán hoặc constructor move thay vì copy khi kiểu và overload hỗ trợ:

```cpp
#include <iterator>
#include <list>
#include <string>
#include <vector>

int main() {
    std::list<std::string> source{"one", "two"};
    std::vector<std::string> copied(source.begin(), source.end());
    std::vector<std::string> moved(std::make_move_iterator(source.begin()),
                                   std::make_move_iterator(source.end()));
    return copied.size() == 2 && moved.size() == 2 ? 0 : 1;
}
```

Hai chuỗi được copy vào `copied`, rồi được chuyển vào `moved`. Các phần tử nguồn vẫn tồn tại nhưng giá trị sau move hợp lệ và không xác định cụ thể theo hợp đồng của `std::string`; không giả định chúng rỗng. Nếu nguồn là `const`, việc move có thể không khả dụng và thao tác có thể dùng copy.

Sách nói move cùng một phần tử nhiều lần luôn là hành vi không xác định. Kết luận đó quá rộng: với kiểu thư viện chuẩn ở trạng thái hợp lệ sau move, có thể thực hiện các thao tác tiếp theo đáp ứng tiền điều kiện, nhưng giá trị không còn bảo đảm như trước. Với kiểu tự định nghĩa phải tuân theo hợp đồng của kiểu đó. Chỉ dùng move iterator khi thuật toán và thời điểm tiêu thụ nguồn phù hợp; `std::move` dạng thuật toán cũng chuyển các phần tử giữa hai phạm vi.
