---
id: chuong-06-phan-13
title: 'Chương 6 · Predicate và lambda'
sidebar_label: '06 · Phần 13: Predicate và lambda'
---

# 6.8.2–6.9 · Predicate và lambda

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 226–233 (PDF trang 255–262). Các ghi chú bổ sung và đính chính được đánh dấu riêng.

## 6.8.2 Predicate

Predicate là callable trả kết quả có thể dùng như giá trị logic, thường để xác định tiêu chí tìm kiếm hoặc so sánh. Unary predicate nhận một đối số; binary predicate nhận hai đối số. Thuật toán có thể sao chép callable hoặc gọi nó nhiều lần, nên không nên thiết kế tiêu chí sao cho kết quả với cùng dữ liệu thay đổi theo số lần gọi.

:::note Trạng thái và hợp đồng
Sách mô tả predicate phải “không có trạng thái”. Cách diễn đạt chính xác hơn là cần tuân thủ yêu cầu của **thuật toán cụ thể**: predicate có thể giữ cấu hình không đổi như một ngưỡng capture theo giá trị, nhưng không nên phụ thuộc vào thứ tự/số lần gọi hoặc thay đổi kết quả không nhất quán. Comparator dùng để sắp xếp phải xác định strict weak ordering.
:::

### Unary predicate: tìm số nguyên tố

Sách dùng `find_if` để tìm phần tử đầu thỏa predicate. Ví dụ sau giữ ý tưởng, nhưng xử lý số âm mà không gọi `abs(INT_MIN)` và dùng điều kiện chia tránh tràn khi bình phương ước:

```cpp
#include <algorithm>
#include <iostream>
#include <list>

bool isPrime(int value) {
    // Sách kiểm tra trị tuyệt đối của số âm.
    long long n = value;
    if (n < 0) n = -n;
    if (n < 2) return false;
    for (long long d = 2; d <= n / d; ++d) {
        if (n % d == 0) return false;
    }
    return true;
}

int main() {
    std::list<int> coll{24, 25, 26, 27, 28, 29, 30};
    auto pos = std::find_if(coll.cbegin(), coll.cend(), isPrime);
    if (pos != coll.cend()) std::cout << *pos << " is first prime number found\n";
    else std::cout << "no prime number found\n";
}
```

Kết quả là `29 is first prime number found`. `find_if` trả iterator tới phần tử đầu làm predicate đúng hoặc iterator cuối nếu không có. Quy ước coi trị tuyệt đối của số âm trong ví dụ là lựa chọn của sách; định nghĩa số nguyên tố thông thường chỉ xét số nguyên dương lớn hơn 1.

### Binary predicate: sắp người theo tên

Với một lớp `Person` có `firstname()` và `lastname()`, sách so sánh họ trước, rồi tên khi họ bằng nhau:

```cpp
bool personSortCriterion(const Person& a, const Person& b) {
    return a.lastname() < b.lastname() ||
           (a.lastname() == b.lastname() && a.firstname() < b.firstname());
}

std::sort(coll.begin(), coll.end(), personSortCriterion);
```

Ví dụ giả định `coll` là `std::deque<Person>` và các hàm thành viên được định nghĩa. Comparator phải nhất quán; dùng `<=` thay `<` có thể vi phạm yêu cầu của `sort`. Một function object riêng cũng có thể làm comparator và có thể được dùng như kiểu comparator của `set`; sách trở lại ví dụ ở mục 10.1.1.

## 6.9 Lambda trong thuật toán

Lambda cho phép đặt hành vi ngay tại vị trí gọi thuật toán. Ví dụ nâng mỗi phần tử `double` lên lũy thừa ba tại chỗ:

```cpp
std::transform(coll.begin(), coll.end(), coll.begin(),
               [](double d) { return d * d * d; });
```

Lambda là một function object. Với `transform` một ngôi, việc đích bắt đầu ngay tại nguồn là trường hợp có thể dùng được nếu các yêu cầu khác được thỏa; không suy rộng cho mọi kiểu chồng lấn hay mọi thuật toán.

### Capture tiêu chí tìm kiếm

```cpp
std::deque<int> coll{1, 3, 19, 5, 13, 7, 11, 2, 17};
int x = 5;
int y = 12;
auto pos = std::find_if(coll.cbegin(), coll.cend(),
                        [=](int i) { return i > x && i < y; });
if (pos != coll.cend()) {
    std::cout << "first elem >5 and <12: " << *pos << '\n'; // 7
}
```

`[=]` capture theo giá trị các biến ngoài được dùng trong lambda; `[&]` capture theo tham chiếu. Bản sách trực tiếp dereference kết quả vì dữ liệu đã cho có phần tử phù hợp; mã trên kiểm tra trường hợp không tìm thấy.

Sách so sánh lambda với vòng lặp viết tay, hàm predicate riêng, function object lưu `x`/`y`, và biểu thức `std::bind` lồng nhau. Ưu điểm chính là tiêu chí nằm gần lời gọi và có thể capture dữ liệu cần thiết mà không phải viết lớp riêng. Hiệu năng phụ thuộc trình biên dịch và ngữ cảnh; không mặc định lambda luôn nhanh hơn một hàm thông thường.

### Lambda làm comparator

```cpp
std::sort(coll.begin(), coll.end(),
          [](const Person& a, const Person& b) {
              return a.lastname() < b.lastname() ||
                     (a.lastname() == b.lastname() &&
                      a.firstname() < b.firstname());
          });
```

Tương tự, có thể dùng kiểu closure làm comparator cho `set`:

```cpp
auto cmp = [](const Person& a, const Person& b) {
    return a.lastname() < b.lastname() ||
           (a.lastname() == b.lastname() && a.firstname() < b.firstname());
};
std::set<Person, decltype(cmp)> people(cmp);
```

Trong C++11, cần truyền đối tượng `cmp` như ví dụ vì closure của lambda không có default constructor theo quy tắc khi đó. Sách cũng nêu lambda có thể làm hash hoặc predicate tương đương cho unordered container.

:::note Góc nhìn hiện đại
Sách nói lambda không thể giữ trạng thái qua các lời gọi; điều này **không đúng tổng quát**. Capture theo giá trị cùng `mutable` có thể thay đổi trạng thái bên trong closure qua các lần gọi. Tuy nhiên, thuật toán có thể sao chép closure, nên không dựa vào một bản sao cụ thể để tích lũy trạng thái trừ khi API bảo đảm điều đó. Từ C++20, closure không capture có thể default-construct và assign trong các điều kiện tương ứng. Capture theo tham chiếu không kéo dài thời hạn sống đối tượng.
:::
