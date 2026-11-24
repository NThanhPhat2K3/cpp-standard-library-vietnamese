---
id: chuong-06-phan-14
title: 'Chương 6 · Function object và trạng thái'
sidebar_label: '06 · Phần 14: Function object'
---

# 6.10–6.10.1 · Function object

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 233–239 (PDF trang 262–268). Các hộp ghi chú là phần bổ sung.

Đối số mô tả hành vi của thuật toán không nhất thiết là một hàm thông thường. Nó có thể là đối tượng có thể gọi bằng `()`, thường được gọi là **function object** hoặc **functor**. Lambda cũng tạo một function object; mục này xét lớp tự định nghĩa `operator()` — kỹ thuật đã có trước C++11.

## Định nghĩa và gọi

```cpp
class PrintInt {
public:
    void operator()(int value) const {
        std::cout << value << ' ';
    }
};

PrintInt print;
print(42);             // tương đương print.operator()(42)
```

Dùng với thuật toán:

```cpp
std::vector<int> coll{1, 2, 3, 4, 5, 6, 7, 8, 9};
std::for_each(coll.cbegin(), coll.cend(), PrintInt());
// 1 2 3 4 5 6 7 8 9
```

`PrintInt()` tạo đối tượng tạm, truyền cho `for_each`; thuật toán gọi nó với từng phần tử. Về ý tưởng, một phiên bản tuần tự đơn giản có thể được viết:

```cpp
template <typename Iterator, typename Operation>
Operation illustrativeForEach(Iterator first, Iterator last, Operation op) {
    while (first != last) {
        op(*first);
        ++first;
    }
    return op;
}
```

Với function object, `op(*first)` gọi `operator()`; với con trỏ hàm, nó gọi hàm tương ứng. Phiên bản chuẩn có những yêu cầu và overload riêng; đây là mô hình giải thích.

## Vì sao function object hữu ích?

Sách nêu ba ưu điểm:

1. **Có thể giữ trạng thái:** các instance cùng kiểu có thể mang cấu hình khác nhau, được khởi tạo lúc chạy.
2. **Hành vi có kiểu riêng:** có thể dùng kiểu functor như tham số template, chẳng hạn kiểu comparator của một container.
3. **Có cơ hội tối ưu:** compiler thường thấy định nghĩa callable khi khởi tạo template và có thể inline.

:::note Hiệu năng
Đó là cơ hội tối ưu, không phải bảo đảm functor luôn nhanh hơn hàm thông thường. Trình biên dịch có thể inline cả hàm, và tối ưu phụ thuộc ngữ cảnh. Lambda cũng là closure object có thể giữ trạng thái.
:::

## Ví dụ: cộng một giá trị được chọn lúc chạy

Nếu giá trị luôn là 10, có thể viết một hàm `add10(int&)`; nếu biết giá trị tại thời điểm biên dịch, có thể dùng function template `add<10>`. Khi giá trị được tính lúc chạy, functor có thể giữ nó như một thành viên thay vì phải dùng biến toàn cục:

```cpp
class AddValue {
    int value;
public:
    explicit AddValue(int v) : value(v) {}
    void operator()(int& elem) const {
        elem += value;
    }
};

std::list<int> coll{1, 2, 3, 4, 5, 6, 7, 8, 9};
std::for_each(coll.begin(), coll.end(), AddValue(10));
// 11 12 13 14 15 16 17 18 19

std::for_each(coll.begin(), coll.end(), AddValue(*coll.begin()));
// 22 23 24 25 26 27 28 29 30
```

Ở lời gọi thứ hai, `AddValue` lưu bản sao của phần tử đầu, lúc đó là `11`, **trước** khi `for_each` sửa các phần tử. Hai đối tượng `AddValue(x)` và `AddValue(y)` có thể cùng tồn tại với cấu hình riêng; lớp còn có thể cung cấp member để đọc hoặc thay đổi trạng thái.

:::warning Bản sao callable
Một số thuật toán có thể sao chép function object và không quy định số lần gọi chính xác cho từng phần tử. Đừng dựa vào trạng thái của một bản sao cụ thể hoặc thứ tự gọi ngoài hợp đồng thuật toán. Với overload tuần tự của `std::for_each`, giá trị callable được trả về có thể dùng để lấy trạng thái kết quả khi kiểu và hợp đồng phù hợp. Predicate và comparator còn phải giữ các yêu cầu nhất quán của thuật toán.
:::

Chương 10 đi sâu vào function object, cách truyền hành vi làm tham số template và những vấn đề do sao chép trạng thái.
