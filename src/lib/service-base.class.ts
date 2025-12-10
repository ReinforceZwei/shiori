// Should avoid importing from internal, but typescript is
// complaining `Prisma.TransactionClient` does not exist
import { TransactionClient } from "@/generated/prisma/internal/prismaNamespace";
import { prisma } from "./prisma";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Base service class providing helper methods for working with Prisma transactions.
 *
 * This class abstracts handling of a Prisma transaction client (from $transaction) and the singleton Prisma client.
 * Use in your service classes to easily support methods that can run either within an existing transaction
 * or outside as standalone operations.
 *
 * - Use `this.prisma` in data-access code to transparently use either the transaction or global client.
 * - Use `withTransaction()` to run a block of logic in a transaction, or to continue an existing one.
 *
 * @example
 * class MyService extends ServiceBase {
 *   async doThing() {
 *     // This will use the transaction client if present, otherwise the global prisma client
 *     await this.prisma.user.create({ data: {...} });
 *   }
 *
 *   async doAtomicOperation() {
 *     return this.withTransaction(async (tx) => {
 *       // Use tx (TransactionClient) for all operations in this scope
 *       await tx.user.create({ ... });
 *       ...
 *     });
 *   }
 * }
 */
export class ServiceBase {
  private readonly _tx?: TransactionClient;
  private _myOwnTx?: TransactionClient;
  private readonly _prisma: PrismaClient;

  /**
   * @param tx Optional prisma transaction client (TransactionClient). If provided, used for all database operations in this service.
   */
  constructor(tx?: TransactionClient) {
    this._tx = tx;
    this._prisma = prisma;
    this._myOwnTx = undefined;
  }

  /**
   * Returns either the transaction client (if this service is within a $transaction), or the global Prisma client.
   */
  protected get prisma(): TransactionClient {
    return this._myOwnTx ?? this._tx ?? this._prisma;
  }

  /**
   * Runs a callback within a Prisma transaction.
   * If this service was constructed with a transaction client, reuses that client; otherwise, starts a new transaction.
   *
   * @template T
   * @param callback Function that receives TransactionClient and returns a Promise
   * @returns Promise<T> Result of the callback
   */
  protected withTransaction<T>(callback: (tx: TransactionClient) => Promise<T>): Promise<T> {
    if (this._myOwnTx || this._tx) {
      return callback(this._myOwnTx ?? this._tx!);
    } else {
      return this._prisma.$transaction(async (tx) => {
        this._myOwnTx = tx;
        try {
          return callback(tx);
        } finally {
          this._myOwnTx = undefined;
        }
      });
    }
  }
}