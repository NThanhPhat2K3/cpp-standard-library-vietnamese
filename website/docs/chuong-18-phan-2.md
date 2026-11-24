---
id: chuong-18-phan-2
title: 'Chương 18 · Chờ future và truyền đối số'
---

Phần này theo mục 18.1.1–18.1.2, trang 952–959: xử lý ngoại lệ, chờ có thời hạn và truyền dữ liệu cho task.

## Ngoại lệ và trạng thái future

Nếu callable của `std::async` kết thúc bằng ngoại lệ chưa bắt, ngoại lệ được lưu trong shared state và được ném lại khi `future.get()` được gọi. `wait()` chỉ chờ; nó không lấy kết quả hoặc ném lại ngoại lệ của task. Sau `get()`, `future` không còn shared state; `valid()` cho biết future có state hay không.

```cpp
#include <cassert>
#include <future>
#include <stdexcept>

int main() {
    auto f = std::async(std::launch::async, []() -> int {
        throw std::runtime_error("task failed");
    });
    f.wait();
    try {
        (void)f.get();
        assert(false);
    } catch (const std::runtime_error&) {}
    assert(!f.valid());
}
```

Sách minh họa ngoại lệ bằng vòng lặp cấp phát vô hạn; ví dụ trên tạo lỗi có giới hạn và cho thấy cùng cơ chế truyền ngoại lệ.

## Chờ và polling

- `wait()` chờ state sẵn sàng; với task deferred, nó thực thi task trong thread gọi.
- `wait_for(duration)` và `wait_until(time_point)` chờ có thời hạn, trả `future_status::ready`, `timeout` hoặc `deferred`.
- Nếu trả `deferred`, timed wait không tự chạy task. Chỉ lặp timed wait đến `ready` có thể không bao giờ kết thúc; xử lý `deferred` riêng hoặc chọn `launch::async`.

```cpp
#include <cassert>
#include <chrono>
#include <future>

int main() {
    auto f = std::async(std::launch::deferred, [] { return 42; });
    const auto status = f.wait_for(std::chrono::seconds(0));
    assert(status == std::future_status::deferred);
    const int value = f.get(); // thực thi task deferred
    assert(value == 42);
}
```

Polling liên tục có thể lãng phí CPU; chờ có thời hạn, làm việc hữu ích khác hoặc dùng cơ chế đồng bộ thích hợp. `yield()` chỉ là gợi ý cho scheduler, không bảo đảm thread khác sẽ chạy. Thời hạn chờ không phải cơ chế hủy task. Nếu future cuối cùng sở hữu shared state từ `launch::async` bị hủy, việc giải phóng state có thể chờ task; một hàm muốn trả kết quả tạm đúng hạn phải thiết kế vòng đời task và future tương ứng.

:::note Lỗi dấu ngoặc trong sách
Một số dòng polling trang 955 đặt phép so sánh vào trong `wait_for`. Cú pháp đúng là `f.wait_for(std::chrono::seconds(0)) != std::future_status::ready`.
:::

### Nhận kết quả từ hai task

Ví dụ trang 955–958 khởi chạy hai công việc, kiểm tra trạng thái rồi gọi `get()` cho từng future. Đoạn sau giữ ý tưởng hai task nhưng bỏ vòng lặp in ký tự và chờ ngẫu nhiên; nó xử lý từng `get()` riêng để lỗi của task thứ nhất không làm bỏ qua kết quả task thứ hai:

```cpp
#include <cassert>
#include <future>
#include <stdexcept>

int main() {
    auto first = std::async(std::launch::async, []() -> int {
        throw std::runtime_error("first failed");
    });
    auto second = std::async(std::launch::async, [] { return 42; });

    bool firstFailed = false;
    try { (void)first.get(); }
    catch (const std::runtime_error&) { firstFailed = true; }

    const int secondResult = second.get();
    assert(firstFailed && secondResult == 42);
}
```

Hai task được yêu cầu chạy bất đồng bộ; thứ tự hoàn tất không được bảo đảm. Trong ví dụ này `get()` thứ hai vẫn được gọi sau khi đã xử lý lỗi thứ nhất. Nếu cả hai task có thể ném, chương trình cần chính sách xử lý phù hợp cho **cả hai**; dùng một khối `try` duy nhất quanh hai lời gọi có thể bỏ qua lời gọi thứ hai khi lời gọi đầu ném.

## Truyền đối số và vòng đời

`async` có thể nhận hàm cùng đối số, function object, member function hoặc lambda. Đối số được lưu để gọi task; dùng `std::ref` khi thực sự muốn truyền tham chiếu. Đối tượng được tham chiếu phải còn sống đến khi task kết thúc, và các truy cập đồng thời phải được đồng bộ nếu có ghi.

```cpp
#include <cassert>
#include <future>

int multiply(int x, int y) { return x * y; }

int main() {
    auto product = std::async(std::launch::async, multiply, 6, 7);
    const int value = product.get();
    assert(value == 42);
}
```

Capture bằng giá trị thường đơn giản khi dữ liệu nhỏ. Capture bằng tham chiếu `const` không tự ngăn thread khác sửa cùng đối tượng; vẫn cần bảo đảm lifetime và tránh data race. Khi chờ nhiều future, nếu một `get()` ném, các future còn lại vẫn cần được xử lý theo chính sách của chương trình.
