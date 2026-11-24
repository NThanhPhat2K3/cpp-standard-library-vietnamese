---
id: chuong-06-phan-5
title: 'Chương 6 · Associative array và container adapter'
sidebar_label: '06 · Phần 5: Associative array và adapter'
---

# 6.2.4–6.2.6 · Associative array và adapter

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 185–188 (PDF trang 214–217). Các hộp ghi chú là phần bổ sung.

## 6.2.4 Associative array

`std::map` và `std::unordered_map` lưu các cặp khóa–giá trị với khóa duy nhất. Chúng có thể được dùng như **associative array**: truy cập giá trị bằng khóa, trong đó khóa không cần là chỉ số nguyên. Hai container cung cấp `operator[]`:

```cpp
#include <iostream>
#include <string>
#include <unordered_map>

int main() {
    std::unordered_map<std::string, float> coll;
    coll["VAT1"] = 0.16f;
    coll["VAT2"] = 0.07f;
    coll["Pi"] = 3.1415f;
    coll["an arbitrary number"] = 4983.223f;
    coll["Null"] = 0;
    coll["VAT1"] += 0.03f;
    std::cout << "VAT difference: "
              << coll["VAT1"] - coll["VAT2"] << '\n';
}
```

Đầu ra theo định dạng mặc định trong ví dụ sách là `VAT difference: 0.12`. Số dấu phẩy động có giới hạn độ chính xác, nên không nên suy ra phép tính thập phân luôn chính xác tuyệt đối.

Khác với chỉ số mảng thông thường, nếu khóa chưa tồn tại, `coll[key]` **chèn một phần tử mới** rồi trả tham chiếu đến mapped value. Với `float`, giá trị mới được value-initialize thành `0`, sau đó phép gán ghi đè giá trị ấy. Vì vậy ngay cả một biểu thức chỉ có vẻ là đọc `coll["missing"]` cũng có thể thay đổi container.

Từ C++11, `at(key)` cho phép truy cập phần tử đã tồn tại và ném `std::out_of_range` nếu không tìm thấy:

```cpp
coll.at("VAT1") = 0.16f; // không chèn nếu thiếu; ném ngoại lệ
```

Để kiểm tra mà không chèn và không dùng ngoại lệ cho khóa thiếu, dùng `find()`; từ C++20 có thể dùng `contains()` khi chỉ cần kiểm tra sự tồn tại. `operator[]` không có trên `multimap` hoặc `unordered_multimap`, vì một khóa có thể ánh xạ tới nhiều phần tử.

Sách nêu unordered map thường có truy cập trung bình hằng số, còn map logarithmic, và gợi ý ưu tiên unordered map khi không cần sắp xếp. Khi chọn thực tế, còn cần xét trường hợp xấu nhất, chất lượng hash, bộ nhớ, tính ổn định thứ tự và hiệu năng đo được; thứ tự duyệt của `map` được xác định bởi comparator. Mục 7.8.3 và 7.9.5 đi sâu vào giao diện này.

## 6.2.5 Các container khác

### String

Các lớp `std::basic_string`, `std::string` và `std::wstring` có nhiều thao tác giống container cho các phần tử ký tự; có thể dùng với nhiều thuật toán STL. Chương 13 và mục 13.2.14 trình bày chi tiết. Một string là một dãy các đơn vị mã ký tự, không nhất thiết mỗi phần tử là một ký tự người dùng nhìn thấy, chẳng hạn với UTF-8.

### Mảng kiểu C

Mảng ngôn ngữ C/C++ không phải là class container STL và không có member như `size()` hay `empty()`. Tuy vậy, iterator dạng con trỏ và các hàm hỗ trợ cho phép áp dụng nhiều thuật toán STL:

```cpp
int values[] = {4, 1, 3};
std::sort(std::begin(values), std::end(values));
```

Ví dụ cần `<algorithm>` và `<iterator>`. Mục 7.10.2 của sách bàn thêm về thuật toán trên mảng. `std::array` và `std::vector` thường cung cấp giao diện tiện lợi hơn cho mảng cố định và mảng động; lựa chọn vẫn phụ thuộc yêu cầu tương thích, quyền sở hữu và thời hạn sống.

### Container do người dùng định nghĩa

Một đối tượng dạng container có thể cung cấp iterator và các thao tác phù hợp để tham gia vào mã tổng quát STL. Ví dụ, một lớp biểu diễn thư mục có thể cho phép duyệt các tệp. Các thao tác chung ở mục 7.1 là điểm tham khảo khi thiết kế.

Không phải cấu trúc nào cũng ánh xạ tự nhiên vào một phạm vi tuyến tính có `begin` và `end`; sách nêu ring buffer là một ví dụ cần cân nhắc cách biểu diễn. Việc cung cấp tên hàm giống container chuẩn không tự bảo đảm kiểu đã đáp ứng mọi yêu cầu iterator hoặc container.

## 6.2.6 Container adapter

Container adapter dùng một container nền để cung cấp giao diện hạn chế cho một chính sách truy cập cụ thể:

| Adapter | Chính sách |
|:---|:---|
| `std::stack` | LIFO: vào sau ra trước. |
| `std::queue` | FIFO: vào trước ra trước. |
| `std::priority_queue` | Phần tử có ưu tiên cao nhất theo comparator nằm ở đầu. |

Ví dụ:

```cpp
#include <queue>
#include <stack>

std::stack<int> undo;
undo.push(1);
undo.push(2);
int latest = undo.top(); // 2
undo.pop();

std::queue<int> jobs;
jobs.push(1);
jobs.push(2);
int first = jobs.front(); // 1
jobs.pop();

std::priority_queue<int> priorities;
priorities.push(3);
priorities.push(8);
int highest = priorities.top(); // 8 với comparator mặc định
```

Nếu nhiều phần tử có cùng ưu tiên, không nên dựa vào một thứ tự ổn định giữa chúng. `top()`/`front()` và `pop()` yêu cầu adapter không rỗng. Adapter thuộc lịch sử STL nhưng sách trình bày riêng ở Chương 12 vì chúng có giao diện chuyên biệt.
