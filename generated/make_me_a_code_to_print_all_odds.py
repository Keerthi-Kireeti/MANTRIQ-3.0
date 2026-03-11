# Summary: A code to print all odd numbers and primes less than 100

# Odd Numbers
for i in range(1, 101):
    if i % 2 == 1:
        print(f"{i}: An odd number")

# Primes Less Than 100
for i in range(1, 101):
    if i > 1 and i % 2 != 0:
        print(f"{i}: A prime number less than 100")
