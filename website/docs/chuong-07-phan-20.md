---
id: chuong-07-phan-20
title: 'Chương 7 · Chuỗi, mảng C và ngữ nghĩa tham chiếu'
sidebar_label: '07 · Phần 20: Chuỗi, mảng C và tham chiếu'
---

# 7.10–7.11 · Chuỗi, mảng C và ngữ nghĩa tham chiếu

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 385–391 (PDF trang 414–420). Ví dụ được trình bày lại để chạy độc lập.

## 7.10 Những cấu trúc khác dùng được với STL

STL là một framework: thuật toán không chỉ làm việc với các container chuẩn mà còn có thể làm việc với cấu trúc khác thông qua iterator phù hợp. Sách phân biệt ba cách:

1. **Tích hợp trực tiếp:** cấu trúc tự cung cấp giao diện cần thiết như `begin()` và `end()`.
2. **Không can thiệp:** cung cấp iterator để nối cấu trúc dữ liệu với thuật toán, không cần sửa cấu trúc đó.
3. **Wrapper:** đóng gói cấu trúc phía sau một lớp có giao diện giống container.

Không phải cứ có `begin/end` là tự động đáp ứng mọi yêu cầu của một *standard container*: từng thuật toán và khái niệm có hợp đồng riêng. Sách nhắc thêm có thể hỗ trợ allocator khi thiết kế container; chủ đề này được trình bày trong chương 19.

### 7.10.1 Chuỗi như container

`std::string` và các lớp chuỗi chuẩn có thể được duyệt như một dãy ký tự: `begin()` và `end()` trả iterator random access, còn `push_back()` cho phép dùng back inserter. Thuật toán STL hữu ích khi cần xử lý từng ký tự, chẳng hạn biến đổi hoặc so sánh với tiêu chí riêng; các thao tác chuỗi thông thường vẫn có thể làm việc trên cả chuỗi. Với UTF-8, một phần tử `char` thường là một **byte**, không nhất thiết là một ký tự Unicode hoàn chỉnh.

### 7.10.2 Mảng C và iterator

Mảng C không có hàm thành viên. Con trỏ tới phần tử hoạt động như random-access iterator; từ C++11, `std::begin` và `std::end` trong `<iterator>` giúp lấy giới hạn khi kích thước mảng còn được biết:

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <vector>

int main() {
    int vals[] = {33, 67, -4, 13, 5, 2};
    std::vector<int> v(std::begin(vals), std::end(vals));
    std::copy(std::begin(v), std::end(v), std::ostream_iterator<int>(std::cout, " "));
    std::cout << '\n';
}
```

Kết quả: `33 67 -4 13 5 2`. Với mảng `vals`, `std::begin(vals)` trỏ tới phần tử đầu, `std::end(vals)` là vị trí sau phần tử cuối; với vector, chúng gọi giao diện iterator tương ứng. Con trỏ sau cuối được dùng làm mốc, không được dereference. Khi mảng đã suy biến thành con trỏ, kích thước không còn được suy ra bằng overload này.

Ví dụ trước C++11 trong sách dùng trực tiếp `coll` và `coll + 6`:

```cpp
#include <algorithm>
#include <functional>
#include <iostream>
#include <iterator>

int main() {
    int coll[] = {5, 6, 2, 4, 1, 3};
    std::transform(coll, coll + 6, coll, coll, std::multiplies<int>());
    std::sort(coll + 1, coll + 6);
    std::copy(coll, coll + 6, std::ostream_iterator<int>(std::cout, " "));
    std::cout << '\n';
}
```

Bình phương từng phần tử rồi chỉ sắp xếp từ phần tử thứ hai cho kết quả `25 1 4 9 16 36`. Phạm vi luôn là nửa mở `[first,last)`; truyền sai giới hạn dẫn đến truy cập không hợp lệ.

## 7.11 Chia sẻ đối tượng giữa các container

Container thường lưu **giá trị của phần tử**; sao chép container sao chép phần tử theo ngữ nghĩa của kiểu đó. Các hàm truy cập thường trả tham chiếu hoặc iterator chứ không nhất thiết trả bản sao. Nếu nhiều container cần cùng tham chiếu tới một đối tượng, có thể lưu smart pointer hoặc `reference_wrapper`, tùy quan hệ sở hữu.

### `shared_ptr`: cùng sở hữu

Ví dụ sách lưu cùng các `Item` trong một `set` và một `deque`. Sửa giá qua một con trỏ sẽ được quan sát qua mọi con trỏ cùng sở hữu đối tượng đó:

```cpp
#include <algorithm>
#include <deque>
#include <iostream>
#include <memory>
#include <set>
#include <string>

struct Item {
    std::string name;
    float price;
    Item(const std::string& n, float p) : name(n), price(p) {}
};
using ItemPtr = std::shared_ptr<Item>;

void printItems(const char* title, const std::deque<ItemPtr>& items) {
    std::cout << title << '\n';
    for (const auto& item : items) std::cout << item->name << ": " << item->price << '\n';
}

int main() {
    std::set<ItemPtr> allItems;
    std::deque<ItemPtr> bestsellers{
        std::make_shared<Item>("Kong Yize", 20.10f),
        std::make_shared<Item>("A Midsummer Night's Dream", 14.99f),
        std::make_shared<Item>("The Maltese Falcon", 9.88f)
    };
    allItems.insert(std::make_shared<Item>("Water", 0.44f));
    allItems.insert(std::make_shared<Item>("Pizza", 2.22f));
    allItems.insert(bestsellers.begin(), bestsellers.end());
    printItems("bestsellers:", bestsellers);
    for (const auto& item : bestsellers) item->price *= 2;
    auto pizza = std::find_if(allItems.begin(), allItems.end(),
        [](const ItemPtr& item) { return item->name == "Pizza"; });
    if (pizza != allItems.end()) bestsellers[1] = *pizza;
    bestsellers[0]->price = 44.77f;
    printItems("after:", bestsellers);
}
```

Sau thay đổi, ba bestseller là `Kong Yize: 44.77`, `Pizza: 2.22` và `The Maltese Falcon: 19.76`. Đối tượng *A Midsummer Night's Dream* vẫn thuộc `allItems` và có giá 29.98. Một bản sao `shared_ptr` được giữ ở nơi khác tiếp tục sở hữu đối tượng ngay cả khi các container bị hủy.

`set<ItemPtr>` trong ví dụ so sánh con trỏ theo comparator mặc định, không so sánh tên hoặc nội dung `Item`. Do đó tạo một `Item` mới tên Pizza rồi gọi `allItems.find` với con trỏ mới không tìm được đối tượng Pizza sẵn có; sách dùng `find_if` để tìm theo tên. Thứ tự in của set con trỏ không phải thứ tự tên và có thể khác giữa các lần chạy. Không sửa dữ liệu được comparator sử dụng làm khóa trong khi đối tượng đang nằm trong set.

### `reference_wrapper`: tham chiếu không sở hữu

Nếu vòng đời đối tượng được bảo đảm dài hơn mọi lần sử dụng tham chiếu, `std::reference_wrapper<T>` cho phép lưu tham chiếu có thể sao chép trong container:

```cpp
#include <functional>
#include <iostream>
#include <string>
#include <vector>

struct Book { std::string name; double price; };
int main() {
    Book faust{"Faust", 12.99};
    std::vector<std::reference_wrapper<Book>> books;
    books.push_back(faust);
    std::cout << books[0].get().name << ": " << books[0].get().price << '\n';
    faust.price = 9.99;
    for (const Book& book : books)
        std::cout << book.name << ": " << book.price << '\n';
}
```

`reference_wrapper` chuyển đổi được sang `T&`; gọi thành viên trực tiếp trên wrapper cần `get()`. Nó **không kéo dài vòng đời** của đối tượng: không sử dụng wrapper sau khi đối tượng được tham chiếu đã bị hủy. Không thể khai báo `std::vector<Item&>` vì container không lưu phần tử kiểu tham chiếu trực tiếp.
