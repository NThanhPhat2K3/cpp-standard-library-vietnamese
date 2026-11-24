---
id: chuong-12-phan-3
title: 'Chương 12 · Container adapter chi tiết và bitset'
---

Phần này theo mục 12.4–12.5, trang 645–653 của sách, mô tả giao diện ba adapter và giới thiệu `bitset`.

## Kiểu thành viên của container adapter

`stack`, `queue` và `priority_queue` có các tên kiểu sau, lấy từ container nền:

| Tên kiểu | Ý nghĩa |
| --- | --- |
| `value_type` | Kiểu phần tử, tương ứng `container_type::value_type`. |
| `reference`, `const_reference` | Kiểu tham chiếu và tham chiếu chỉ đọc của container nền; có từ C++11. |
| `size_type` | Kiểu số nguyên không dấu biểu diễn kích thước. |
| `container_type` | Kiểu container nền. |

## Khởi tạo

Constructor mặc định tạo adapter rỗng. `stack` và `queue` có thể khởi tạo từ container nền bằng bản sao hoặc bằng move; nếu container không hỗ trợ move thích hợp, việc khởi tạo có thể sao chép. Các overload dùng allocator được bổ sung từ C++11 khi container hỗ trợ.

```cpp
#include <deque>
#include <queue>
#include <stack>
#include <utility>

std::deque<int> values{1, 2, 3};
std::stack<int> s(values);            // sao chép container
std::queue<int> q(std::move(values)); // chuyển container
```

`priority_queue` có các constructor riêng để nhận comparator và dữ liệu ban đầu. Với dải `[begin, end)`, phần tử nguồn cần chuyển đổi được sang `value_type`; có thể truyền comparator và container nền ban đầu, khi đó hàng đợi nhận cả phần tử của container lẫn dải. Một số overload hỗ trợ allocator. Container được tổ chức thành heap trong quá trình khởi tạo.

```cpp
#include <functional>
#include <queue>
#include <vector>

std::vector<int> data{4, 1, 7};
std::priority_queue<int> largest(data.begin(), data.end());
std::priority_queue<int, std::vector<int>, std::greater<int>> smallest(
    data.begin(), data.end(), std::greater<int>());
```

Trong phạm vi giao diện mô tả ở sách, constructor chỉ nhận container nền dành cho `stack` và `queue`; với `priority_queue`, truyền comparator cùng container khi cần khởi tạo từ container.

## Thao tác và so sánh

- `empty()` kiểm tra rỗng; `size()` trả số phần tử. Sách khuyên dùng `empty()` khi chỉ cần kiểm tra rỗng vì có thể nhanh hơn.
- `push(const value_type&)` thêm bản sao. Overload nhận rvalue, có từ C++11, cho phép chuyển phần tử khi kiểu hỗ trợ; nếu không có phép move phù hợp, có thể dùng phép sao chép.
- `emplace(args...)`, từ C++11, tạo phần tử từ các đối số đưa vào.
- `stack::top()` trả phần tử thêm gần nhất; `queue::front()` trả phần tử thêm sớm nhất còn lại; `queue::back()` trả phần tử thêm gần nhất còn lại. Với adapter không `const`, các thao tác này có thể trả tham chiếu cho phép sửa phần tử.
- `priority_queue::top()` trả tham chiếu chỉ đọc tới phần tử có ưu tiên cao nhất theo comparator. Nếu nhiều phần tử cùng ưu tiên cao nhất, phần tử được chọn không được đảm bảo.
- `pop()` xóa phần tử kế tiếp và trả `void`. Hãy truy cập trước khi xóa nếu cần giá trị. Các thao tác truy cập và `pop()` yêu cầu adapter không rỗng; vi phạm dẫn đến hành vi không xác định.
- `swap` dạng hàm thành viên hoặc hàm tự do trao đổi container nền; với `priority_queue`, comparator cũng được trao đổi. Các thao tác swap này có từ C++11.

Trong giao diện C++11 của sách, hai `stack` hoặc hai `queue` cùng kiểu hỗ trợ `==`, `!=`, `<`, `>`, `<=`, `>=`. Hai adapter bằng nhau khi cùng số lượng và từng phần tử tương ứng bằng nhau; quan hệ thứ tự là so sánh từ điển trên container nền. `priority_queue` không cung cấp các toán tử so sánh này. Các toán tử hiện có tùy thuộc phiên bản C++ và khả năng so sánh của container nền.

## Bitset: tập bit có kích thước cố định

`std::bitset<N>` trong `<bitset>` biểu diễn `N` bit hoặc giá trị Boolean. `N` là tham số template kiểu số nguyên không dấu, không phải tham số kiểu; số bit cố định theo kiểu và không thể thay đổi sau khi tạo. `bitset<8>` và `bitset<16>` là hai kiểu khác nhau: các phép so sánh và kết hợp bitset yêu cầu cùng kích thước. Nếu cần số lượng bit thay đổi, sách giới thiệu `vector<bool>` ở mục 7.3.6.

So với dùng một kiểu số nguyên cùng các toán tử bit, bitset hỗ trợ số bit do template quyết định, truy cập từng bit, xuất và nhập chuỗi bit, cùng nhiều thao tác khác.

### Dùng các bit làm cờ

```cpp
#include <bitset>
#include <iostream>

enum Color { red, yellow, green, blue, white, black, numColors };

int main() {
    std::bitset<numColors> usedColors;
    usedColors.set(red);
    usedColors.set(blue);

    std::cout << "bitfield: " << usedColors << '\n';
    std::cout << "count: " << usedColors.count() << '\n';
    std::cout << "unused: " << ~usedColors << '\n';
    if (usedColors.any()) {
        for (int c = 0; c < numColors; ++c) {
            if (usedColors[static_cast<Color>(c)]) {
                std::cout << "used color index: " << c << '\n';
            }
        }
    }
}
```

Mỗi giá trị enum là vị trí một bit, `numColors` xác định kích thước. `set(pos)` bật bit, `count()` đếm bit bật, `~` đảo các bit trong một bitset mới và `any()` kiểm tra có ít nhất một bit bật. Khi in, bit có chỉ số cao hơn xuất hiện bên trái: ví dụ trên cho `001001`, vì `red` ở vị trí 0 và `blue` ở vị trí 3.

### Thao tác trên các cờ

Ngoài các thao tác trong ví dụ của sách, các hàm sau giúp thao tác trực tiếp với bitset:

| Thao tác | Ý nghĩa |
| --- | --- |
| `set()`, `set(pos, value)` | Bật mọi bit, hoặc đặt một bit theo Boolean. |
| `reset()`, `reset(pos)` | Tắt mọi bit hoặc một bit. |
| `flip()`, `flip(pos)` | Đảo mọi bit hoặc một bit. |
| `test(pos)`, `operator[](pos)` | Đọc bit tại vị trí; `test` kiểm tra phạm vi. |
| `all()`, `any()`, `none()` | Kiểm tra mọi bit bật, có bit bật hoặc không có bit bật. |
| `&`, `\|`, `^`, `~`, `<<`, `>>` | Kết hợp, đảo hoặc dịch các bit; phép kết hợp yêu cầu cùng kích thước. |

```cpp
#include <bitset>
#include <cassert>
#include <stdexcept>

int main() {
    std::bitset<8> flags;
    flags.set(1).set(3);
    flags.flip(1);
    assert(flags.count() == 1 && flags.test(3));
    const std::bitset<8> mask(0x0f);
    assert((flags & mask).to_ulong() == 8);
    flags.reset();
    assert(flags.none());

    bool caught = false;
    try { flags.test(8); }
    catch (const std::out_of_range&) { caught = true; }
    assert(caught);
}
```

`test`, `set`, `reset` và `flip` dạng nhận vị trí ném `out_of_range` khi vị trí không hợp lệ. Với `operator[]`, caller phải bảo đảm chỉ số hợp lệ; không dùng nó để kiểm tra phạm vi. `operator[]` trên bitset không const trả một đối tượng tham chiếu đại diện cho bit, không phải `bool&` thông thường.

### Đổi giữa số, chuỗi và biểu diễn nhị phân

```cpp
#include <bitset>
#include <iostream>
#include <limits>
#include <string>

int main() {
    std::cout << std::bitset<std::numeric_limits<unsigned short>::digits>(267) << '\n';
    std::cout << std::bitset<24>(10000000) << '\n';
    std::string s = std::bitset<42>(12345678).to_string();
    std::cout << s << '\n';
    std::cout << std::bitset<100>("1000101011").to_ullong() << '\n';
}
```

Dòng cuối cho `555`. Độ rộng của dòng đầu phụ thuộc `unsigned short` trên hệ thống. Khi chuyển sang `unsigned long long`, `to_ullong()` ném `std::overflow_error` nếu **giá trị** không biểu diễn được; một `bitset` có nhiều bit hơn độ rộng kiểu đích vẫn chuyển được nếu các bit cao dư đều bằng 0, như ví dụ `bitset<100>` trên. Tương tự, `to_ulong()` chuyển sang `unsigned long` và có thể ném ngoại lệ khi tràn. Đây là điểm cần hiểu chính xác hơn câu mô tả giới hạn số bit trong sách.

### Những bổ sung C++11 được sách nêu

- Khởi tạo trực tiếp từ chuỗi ký tự; trước C++11 cần tạo `std::string` tường minh trong ví dụ trên.
- Hỗ trợ chuyển đổi với `unsigned long long`, gồm `to_ullong()`.
- Cho phép chỉ định ký tự biểu diễn bit bật và tắt khi chuyển đổi chuỗi.
- Thêm `all()` để kiểm tra tất cả bit đều bật, và hàm băm mặc định cho phép dùng bitset trong unordered container.
- Trước C++11, ví dụ `to_string()` phải ghi rõ các tham số template kiểu ký tự, traits và allocator; C++11 cung cấp giá trị mặc định.

Ví dụ dùng ký tự `o` cho bit tắt và `x` cho bit bật, một khả năng được sách liệt kê trong các thay đổi C++11:

```cpp
#include <bitset>
#include <cassert>
#include <stdexcept>
#include <string>

int main() {
    const std::string text("oxxo");
    const std::bitset<4> bits(text, 0, std::string::npos, 'o', 'x');
    assert(bits.to_ulong() == 6);
    assert(bits.to_string('o', 'x') == text);

    bool invalid = false;
    try {
        std::bitset<4> wrong(std::string("ox?o"), 0,
                             std::string::npos, 'o', 'x');
    } catch (const std::invalid_argument&) {
        invalid = true;
    }
    assert(invalid);
}
```

Chuỗi được đọc với bit có trọng số cao hơn ở bên trái; các ký tự đã chọn phải là `o` hoặc `x`, nếu không constructor báo `invalid_argument`. Đây là ví dụ bổ sung để làm rõ cách dùng tùy chọn, không phải chương trình nguyên văn trong sách.

Mục 12.5.2 của sách cho biết tài liệu tham khảo chi tiết từng thành viên `bitset` nằm trong chương bổ sung trên website của sách, không được in tại đây.
